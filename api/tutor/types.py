from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class OutputValidationResult(BaseModel):
    """
    Detailed audit result produced by the OutputValidator verifying
    that all claims and inline citation IDs are strictly grounded
    within the permitted temporal scope.
    """
    is_valid: bool
    detected_citation_ids: List[str] = Field(default_factory=list)
    admitted_citation_ids: List[str] = Field(default_factory=list)
    invalid_citation_ids: List[str] = Field(default_factory=list)
    unsupported_claims_flagged: bool = False
    retry_count: int = 0
    reason: Optional[str] = None
    sanitized_answer: Optional[str] = None
    audit_log: Dict[str, Any] = Field(default_factory=dict)
