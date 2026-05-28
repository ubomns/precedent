import os
import json
from openai import AsyncOpenAI
from app.schemas.brd import BriefInput

_client = None

def get_client():
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _client

CRITIC_SCHEMA = {
    "name": "CriticFeedback",
    "schema": {
        "type": "object",
        "properties": {
            "feedback": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "severity": {"type": "string", "enum": ["low", "medium", "high"]},
                        "issue": {"type": "string", "description": "Description of the issue found."},
                        "suggestion": {"type": "string", "description": "Specific suggestion for improvement."}
                    },
                    "required": ["severity", "issue", "suggestion"],
                    "additionalProperties": False
                }
            }
        },
        "required": ["feedback"],
        "additionalProperties": False
    }
}

async def critique_section(section_name: str, drafted_content: dict, brief: BriefInput) -> list:
    system_prompt = (
        f"You are a senior Business Analyst reviewing the '{section_name}' section of a BRD. "
        "Your job is to identify gaps, ambiguities, or weaknesses compared to enterprise standards. "
        "Be honest and specific. Return structured feedback with severity tags.\n\n"
        "CRITICAL: When critiquing a specific item (requirement, criterion, control, stakeholder, etc.), "
        "you MUST reference it by its exact identifier — e.g., 'FR-01', 'NFR-02 Availability', "
        "'AC-03', 'SC-05 Encryption', 'UAM-01 Partner Admin', 'Stakeholder: Priya Anand', etc. "
        "Do not use generic phrases like 'The Availability requirement' without the ID. "
        "Always prefix the critique with the item's identifier so the reader knows exactly which element is being discussed."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": (
            f"Project Brief:\n{brief.model_dump_json(indent=2)}\n\n"
            f"Drafted Section ('{section_name}'):\n{json.dumps(drafted_content, indent=2)}\n\n"
            "Review this section and provide structured feedback. "
            "For every issue that relates to a specific item, begin the issue description with the item's identifier."
        )}
    ]
    
    response = await get_client().chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages,
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": CRITIC_SCHEMA["name"],
                "schema": CRITIC_SCHEMA["schema"],
                "strict": True
            }
        },
        temperature=0.3,
        max_tokens=1024
    )

    try:
        result = json.loads(response.choices[0].message.content)
        return result.get("feedback", [])
    except json.JSONDecodeError as e:
        import logging
        logging.error(f"Critic JSON decode error for '{section_name}': {e}")
        return []
