from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# Validation limits for user-facing input fields.
MAX_SHORT_TEXT = 1000
MAX_LONG_TEXT = 2000
MAX_LIST_ITEMS = 50
MAX_PROJECT_NAME = 200

class Stakeholder(BaseModel):
    name: str = Field(..., max_length=MAX_SHORT_TEXT)
    role: str = Field(..., max_length=MAX_SHORT_TEXT)
    raci: Literal["R", "A", "C", "I"] = "C"

class FunctionalRequirement(BaseModel):
    id: str = Field(..., max_length=MAX_SHORT_TEXT)
    requirement: str = Field(..., max_length=MAX_LONG_TEXT)
    priority: Literal["Must Have", "Should Have", "Could Have"]

class NonFunctionalRequirement(BaseModel):
    category: str = Field(..., max_length=MAX_SHORT_TEXT)
    requirement: str = Field(..., max_length=MAX_LONG_TEXT)
    metric: str = Field(..., max_length=MAX_LONG_TEXT)

class AcceptanceCriterion(BaseModel):
    requirement_id: str = Field(..., max_length=MAX_SHORT_TEXT)
    criteria: str = Field(..., max_length=MAX_LONG_TEXT)

class IAMRole(BaseModel):
    role: str = Field(..., max_length=MAX_SHORT_TEXT)
    permissions: str = Field(..., max_length=MAX_LONG_TEXT)
    iam_group: str = Field(..., max_length=MAX_SHORT_TEXT)

class SecurityControl(BaseModel):
    domain: str = Field(..., max_length=MAX_SHORT_TEXT)
    control: str = Field(..., max_length=MAX_LONG_TEXT)
    implementation: str = Field(..., max_length=MAX_LONG_TEXT)

class Benefit(BaseModel):
    benefit: str = Field(..., max_length=MAX_LONG_TEXT)
    measurement: str = Field(..., max_length=MAX_LONG_TEXT)
    timeline: str = Field(..., max_length=MAX_SHORT_TEXT)

class CriticFeedbackItem(BaseModel):
    severity: Literal["low", "medium", "high"]
    issue: str = Field(..., max_length=MAX_LONG_TEXT)
    suggestion: str = Field(..., max_length=MAX_LONG_TEXT)

class SectionOutput(BaseModel):
    content: dict
    feedback: List[CriticFeedbackItem]

class BriefInput(BaseModel):
    project_objective: str = Field(..., max_length=MAX_LONG_TEXT, description="The core objective of the project.")
    stakeholders: List[Stakeholder] = Field(default_factory=list, max_length=MAX_LIST_ITEMS)
    scope_in: List[str] = Field(default_factory=list, max_length=MAX_LIST_ITEMS, description="Items in scope.")
    scope_out: List[str] = Field(default_factory=list, max_length=MAX_LIST_ITEMS, description="Items out of scope.")
    target_users: str = Field(..., max_length=MAX_LONG_TEXT, description="Who will use the system.")
    regulatory_context: str = Field(..., max_length=MAX_LONG_TEXT, description="Regulatory or compliance context.")

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

# ─────────────────────────────────────────────────────────────────────────────
# Strictly-typed section content models for export validation.
# These mirror the OpenAI JSON schemas in agents/drafter.py.
# ─────────────────────────────────────────────────────────────────────────────
class ExecutiveSummaryContent(BaseModel):
    narrative: str = Field(..., max_length=MAX_LONG_TEXT)

class BusinessObjectiveContent(BaseModel):
    narrative: str = Field(..., max_length=MAX_LONG_TEXT)

class ScopeContent(BaseModel):
    in_scope: List[str] = Field(..., max_length=MAX_LIST_ITEMS)
    out_of_scope: List[str] = Field(..., max_length=MAX_LIST_ITEMS)

class StakeholdersContent(BaseModel):
    stakeholders: List[Stakeholder] = Field(..., max_length=MAX_LIST_ITEMS)

class FunctionalRequirementsContent(BaseModel):
    requirements: List[FunctionalRequirement] = Field(..., max_length=MAX_LIST_ITEMS)

class NonFunctionalRequirementsContent(BaseModel):
    requirements: List[NonFunctionalRequirement] = Field(..., max_length=MAX_LIST_ITEMS)

class AssumptionsContent(BaseModel):
    assumptions: List[str] = Field(..., max_length=MAX_LIST_ITEMS)

class ConstraintsContent(BaseModel):
    constraints: List[str] = Field(..., max_length=MAX_LIST_ITEMS)

class AcceptanceCriteriaContent(BaseModel):
    criteria: List[AcceptanceCriterion] = Field(..., max_length=MAX_LIST_ITEMS)

class UserAccessManagementContent(BaseModel):
    roles: List[IAMRole] = Field(..., max_length=MAX_LIST_ITEMS)

class SecurityControlsContent(BaseModel):
    controls: List[SecurityControl] = Field(..., max_length=MAX_LIST_ITEMS)

class BenefitsRealizationContent(BaseModel):
    benefits: List[Benefit] = Field(..., max_length=MAX_LIST_ITEMS)

class TypedExecutiveSummarySection(BaseModel):
    content: ExecutiveSummaryContent
    feedback: List[CriticFeedbackItem] = Field(default_factory=list)

class TypedBusinessObjectiveSection(BaseModel):
    content: BusinessObjectiveContent
    feedback: List[CriticFeedbackItem] = Field(default_factory=list)

class TypedScopeSection(BaseModel):
    content: ScopeContent
    feedback: List[CriticFeedbackItem] = Field(default_factory=list)

class TypedStakeholdersSection(BaseModel):
    content: StakeholdersContent
    feedback: List[CriticFeedbackItem] = Field(default_factory=list)

class TypedFunctionalRequirementsSection(BaseModel):
    content: FunctionalRequirementsContent
    feedback: List[CriticFeedbackItem] = Field(default_factory=list)

class TypedNonFunctionalRequirementsSection(BaseModel):
    content: NonFunctionalRequirementsContent
    feedback: List[CriticFeedbackItem] = Field(default_factory=list)

class TypedAssumptionsSection(BaseModel):
    content: AssumptionsContent
    feedback: List[CriticFeedbackItem] = Field(default_factory=list)

class TypedConstraintsSection(BaseModel):
    content: ConstraintsContent
    feedback: List[CriticFeedbackItem] = Field(default_factory=list)

class TypedAcceptanceCriteriaSection(BaseModel):
    content: AcceptanceCriteriaContent
    feedback: List[CriticFeedbackItem] = Field(default_factory=list)

class TypedUserAccessManagementSection(BaseModel):
    content: UserAccessManagementContent
    feedback: List[CriticFeedbackItem] = Field(default_factory=list)

class TypedSecurityControlsSection(BaseModel):
    content: SecurityControlsContent
    feedback: List[CriticFeedbackItem] = Field(default_factory=list)

class TypedBenefitsRealizationSection(BaseModel):
    content: BenefitsRealizationContent
    feedback: List[CriticFeedbackItem] = Field(default_factory=list)

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

class ExportBRDDocument(BaseModel):
    """Strict export-time BRD model with typed section contents."""
    executive_summary: Optional[TypedExecutiveSummarySection] = None
    business_objective: Optional[TypedBusinessObjectiveSection] = None
    scope: Optional[TypedScopeSection] = None
    stakeholders: Optional[TypedStakeholdersSection] = None
    functional_requirements: Optional[TypedFunctionalRequirementsSection] = None
    non_functional_requirements: Optional[TypedNonFunctionalRequirementsSection] = None
    assumptions: Optional[TypedAssumptionsSection] = None
    constraints: Optional[TypedConstraintsSection] = None
    acceptance_criteria: Optional[TypedAcceptanceCriteriaSection] = None
    user_access_management: Optional[TypedUserAccessManagementSection] = None
    security_controls: Optional[TypedSecurityControlsSection] = None
    benefits_realization: Optional[TypedBenefitsRealizationSection] = None
