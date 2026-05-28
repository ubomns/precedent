from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class Stakeholder(BaseModel):
    name: str
    role: str
    raci: Literal["R", "A", "C", "I"] = "C"

class FunctionalRequirement(BaseModel):
    id: str
    requirement: str
    priority: Literal["Must Have", "Should Have", "Could Have"]

class NonFunctionalRequirement(BaseModel):
    category: str
    requirement: str
    metric: str

class AcceptanceCriterion(BaseModel):
    requirement_id: str
    criteria: str

class IAMRole(BaseModel):
    role: str
    permissions: str
    iam_group: str

class SecurityControl(BaseModel):
    domain: str
    control: str
    implementation: str

class Benefit(BaseModel):
    benefit: str
    measurement: str
    timeline: str

class CriticFeedbackItem(BaseModel):
    severity: Literal["low", "medium", "high"]
    issue: str
    suggestion: str

class SectionOutput(BaseModel):
    content: dict
    feedback: List[CriticFeedbackItem]

class BriefInput(BaseModel):
    project_objective: str = Field(..., description="The core objective of the project.")
    stakeholders: List[Stakeholder] = Field(default_factory=list)
    scope_in: List[str] = Field(default_factory=list, description="Items in scope.")
    scope_out: List[str] = Field(default_factory=list, description="Items out of scope.")
    target_users: str = Field(..., description="Who will use the system.")
    regulatory_context: str = Field(..., description="Regulatory or compliance context.")

class ExecutiveSummarySection(SectionOutput):
    pass

class BusinessObjectiveSection(SectionOutput):
    pass

class ScopeSection(SectionOutput):
    pass

class StakeholdersSection(SectionOutput):
    pass

class FunctionalRequirementsSection(SectionOutput):
    pass

class NonFunctionalRequirementsSection(SectionOutput):
    pass

class AssumptionsSection(SectionOutput):
    pass

class ConstraintsSection(SectionOutput):
    pass

class AcceptanceCriteriaSection(SectionOutput):
    pass

class UserAccessManagementSection(SectionOutput):
    pass

class SecurityControlsSection(SectionOutput):
    pass

class BenefitsRealizationSection(SectionOutput):
    pass

class BRDDocument(BaseModel):
    executive_summary: Optional[SectionOutput] = None
    business_objective: Optional[SectionOutput] = None
    scope: Optional[SectionOutput] = None
    stakeholders: Optional[SectionOutput] = None
    functional_requirements: Optional[SectionOutput] = None
    non_functional_requirements: Optional[SectionOutput] = None
    assumptions: Optional[SectionOutput] = None
    constraints: Optional[SectionOutput] = None
    acceptance_criteria: Optional[SectionOutput] = None
    user_access_management: Optional[SectionOutput] = None
    security_controls: Optional[SectionOutput] = None
    benefits_realization: Optional[SectionOutput] = None
