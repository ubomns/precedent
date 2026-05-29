import asyncio
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from _lib.agents.drafter import draft_section, SECTION_SCHEMAS, get_client
from _lib.agents.critic import critique_section
from _lib.schemas.brd import BriefInput

router = APIRouter()

class RegenerateRequest(BaseModel):
    section_name: str
    brief: BriefInput
    prompt: Optional[str] = None

class ApplyCritiqueRequest(BaseModel):
    section_name: str
    brief: BriefInput
    current_content: dict
    critique_issue: str
    critique_suggestion: str

class CritiqueRequest(BaseModel):
    brd: dict
    brief: BriefInput

@router.post("/generate")
async def generate_brd(brief: BriefInput):
    """
    Accepts a structured brief and returns a complete BRD document.
    Runs drafter for each of the 12 sections. Critique is run separately on demand.
    """
    try:
        sections = [
            "executive_summary",
            "business_objective",
            "scope",
            "stakeholders",
            "functional_requirements",
            "non_functional_requirements",
            "assumptions",
            "constraints",
            "acceptance_criteria",
            "user_access_management",
            "security_controls",
            "benefits_realization",
        ]
        
        # Run all 12 section drafts concurrently
        drafted_sections = await asyncio.gather(
            *[draft_section(name, brief) for name in sections]
        )
        
        brd_data = {
            name: {"content": drafted, "feedback": []}
            for name, drafted in zip(sections, drafted_sections)
        }
        
        return {"brd": brd_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import logging

@router.post("/critique")
async def run_critique(request: CritiqueRequest):
    """
    Runs critic review on all sections of an existing BRD.
    """
    try:
        section_items = list(request.brd.items())

        async def safe_critique(name, data):
            try:
                critique = await critique_section(name, data.get("content", {}), request.brief)
                return name, data, critique
            except Exception as e:
                logging.error(f"Critique failed for section '{name}': {e}")
                return name, data, []

        results = await asyncio.gather(
            *[safe_critique(name, data) for name, data in section_items]
        )

        result = {
            name: {"content": data.get("content", {}), "feedback": critique}
            for name, data, critique in results
        }
        return {"brd": result}
    except Exception as e:
        logging.error(f"Critique endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/regenerate-section")
async def regenerate_section(request: RegenerateRequest):
    """
    Regenerates a single section. Optionally applies an edit prompt.
    """
    try:
        config = SECTION_SCHEMAS.get(request.section_name)
        
        if not config:
            raise ValueError(f"Unknown section: {request.section_name}")
        
        system_prompt = (
            f"You are an expert Business Analyst drafting the '{request.section_name}' section of a Business Requirements Document. "
            "Use the provided project brief to generate precise, enterprise-grade content. "
        )
        
        if request.prompt:
            system_prompt += f"\n\nADDITIONAL INSTRUCTIONS FROM USER: {request.prompt}\n\nApply these instructions when regenerating the section."
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Project Brief:\n{request.brief.model_dump_json(indent=2)}\n\nDraft the '{request.section_name}' section."}
        ]

        response = await get_client().chat.completions.create(
            model="gpt-4.1-mini",
            messages=messages,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": config["name"],
                    "schema": config["schema"],
                    "strict": True
                }
            },
            temperature=0.4,
            max_tokens=1536
        )

        drafted = json.loads(response.choices[0].message.content)
        
        return {
            "content": drafted,
            "feedback": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/apply-critique")
async def apply_critique(request: ApplyCritiqueRequest):
    """
    Applies a critique suggestion to a section. Returns updated content.
    """
    try:
        config = SECTION_SCHEMAS.get(request.section_name)
        
        if not config:
            raise ValueError(f"Unknown section: {request.section_name}")
        
        system_prompt = (
            f"You are an expert Business Analyst revising the '{request.section_name}' section of a BRD. "
            "You have received specific feedback. Rewrite the section to address the feedback while keeping all existing valid content. "
            "Return ONLY valid JSON conforming to the schema."
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": (
                f"Project Brief:\n{request.brief.model_dump_json(indent=2)}\n\n"
                f"Current Section Content:\n{json.dumps(request.current_content, indent=2)}\n\n"
                f"Feedback Issue: {request.critique_issue}\n"
                f"Suggested Fix: {request.critique_suggestion}\n\n"
                f"Please rewrite the '{request.section_name}' section incorporating the suggested fix."
            )}
        ]

        response = await get_client().chat.completions.create(
            model="gpt-4.1-mini",
            messages=messages,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": config["name"],
                    "schema": config["schema"],
                    "strict": True
                }
            },
            temperature=0.4,
            max_tokens=1024
        )

        updated = json.loads(response.choices[0].message.content)
        return {"content": updated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
