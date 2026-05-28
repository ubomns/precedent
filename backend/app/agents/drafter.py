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

SECTION_SCHEMAS = {
    "executive_summary": {
        "name": "ExecutiveSummary",
        "schema": {
            "type": "object",
            "properties": {
                "narrative": {"type": "string", "description": "A concise executive summary of the project."}
            },
            "required": ["narrative"],
            "additionalProperties": False
        }
    },
    "business_objective": {
        "name": "BusinessObjective",
        "schema": {
            "type": "object",
            "properties": {
                "narrative": {"type": "string", "description": "The primary business objective and success criteria."}
            },
            "required": ["narrative"],
            "additionalProperties": False
        }
    },
    "scope": {
        "name": "Scope",
        "schema": {
            "type": "object",
            "properties": {
                "in_scope": {"type": "array", "items": {"type": "string"}, "description": "Items included in the project scope."},
                "out_of_scope": {"type": "array", "items": {"type": "string"}, "description": "Items explicitly excluded from the project scope."}
            },
            "required": ["in_scope", "out_of_scope"],
            "additionalProperties": False
        }
    },
    "stakeholders": {
        "name": "Stakeholders",
        "schema": {
            "type": "object",
            "properties": {
                "stakeholders": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "role": {"type": "string"},
                            "raci": {"type": "string", "enum": ["R", "A", "C", "I"]}
                        },
                        "required": ["name", "role", "raci"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["stakeholders"],
            "additionalProperties": False
        }
    },
    "functional_requirements": {
        "name": "FunctionalRequirements",
        "schema": {
            "type": "object",
            "properties": {
                "requirements": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "requirement": {"type": "string"},
                            "priority": {"type": "string", "enum": ["Must Have", "Should Have", "Could Have"]}
                        },
                        "required": ["id", "requirement", "priority"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["requirements"],
            "additionalProperties": False
        }
    },
    "non_functional_requirements": {
        "name": "NonFunctionalRequirements",
        "schema": {
            "type": "object",
            "properties": {
                "requirements": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "category": {"type": "string"},
                            "requirement": {"type": "string"},
                            "metric": {"type": "string"}
                        },
                        "required": ["category", "requirement", "metric"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["requirements"],
            "additionalProperties": False
        }
    },
    "assumptions": {
        "name": "Assumptions",
        "schema": {
            "type": "object",
            "properties": {
                "assumptions": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["assumptions"],
            "additionalProperties": False
        }
    },
    "constraints": {
        "name": "Constraints",
        "schema": {
            "type": "object",
            "properties": {
                "constraints": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["constraints"],
            "additionalProperties": False
        }
    },
    "acceptance_criteria": {
        "name": "AcceptanceCriteria",
        "schema": {
            "type": "object",
            "properties": {
                "criteria": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "requirement_id": {"type": "string"},
                            "criteria": {"type": "string"}
                        },
                        "required": ["requirement_id", "criteria"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["criteria"],
            "additionalProperties": False
        }
    },
    "user_access_management": {
        "name": "UserAccessManagement",
        "schema": {
            "type": "object",
            "properties": {
                "roles": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "role": {"type": "string"},
                            "permissions": {"type": "string"},
                            "iam_group": {"type": "string"}
                        },
                        "required": ["role", "permissions", "iam_group"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["roles"],
            "additionalProperties": False
        }
    },
    "security_controls": {
        "name": "SecurityControls",
        "schema": {
            "type": "object",
            "properties": {
                "controls": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "domain": {"type": "string"},
                            "control": {"type": "string"},
                            "implementation": {"type": "string"}
                        },
                        "required": ["domain", "control", "implementation"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["controls"],
            "additionalProperties": False
        }
    },
    "benefits_realization": {
        "name": "BenefitsRealization",
        "schema": {
            "type": "object",
            "properties": {
                "benefits": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "benefit": {"type": "string"},
                            "measurement": {"type": "string"},
                            "timeline": {"type": "string"}
                        },
                        "required": ["benefit", "measurement", "timeline"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["benefits"],
            "additionalProperties": False
        }
    }
}

async def draft_section(section_name: str, brief: BriefInput) -> dict:
    config = SECTION_SCHEMAS.get(section_name)
    if not config:
        raise ValueError(f"Unknown section: {section_name}")
    
    system_prompt = (
        f"You are an expert Business Analyst drafting the '{section_name}' section of a Business Requirements Document. "
        "Use the provided project brief to generate precise, enterprise-grade content. "
        "Return ONLY valid JSON conforming to the schema. Do not include markdown formatting."
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Project Brief:\n{brief.model_dump_json(indent=2)}\n\nDraft the '{section_name}' section."}
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
    
    return json.loads(response.choices[0].message.content)
