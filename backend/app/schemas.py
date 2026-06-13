from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional, List, Any

# ─── Agent schemas ────────────────────────────────────────────────────────────

class AgentBrief(BaseModel):
    """Minimal agent info embedded inside a Ticket response."""
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True

class AgentWithLoad(BaseModel):
    """Agent info including category specializations and current workload."""
    id: int
    name: str
    email: EmailStr
    categories: List[str] = []
    open_ticket_count: int = 0

    class Config:
        from_attributes = True

# ─── Ticket schemas ───────────────────────────────────────────────────────────

# Schema for creating a ticket (what we expect from the client)
class TicketCreate(BaseModel):
    subject: str
    message: str

    @field_validator('subject', 'message')
    @classmethod
    def not_blank(cls, v: str, info) -> str:
        if not v or not v.strip():
            raise ValueError(f"{info.field_name} cannot be empty")
        return v.strip()

    @field_validator('subject')
    @classmethod
    def subject_length(cls, v: str) -> str:
        if len(v) < 3 or len(v) > 200:
            raise ValueError("subject must be between 3 and 200 characters")
        return v

    @field_validator('message')
    @classmethod
    def message_length(cls, v: str) -> str:
        if len(v) < 10 or len(v) > 5000:
            raise ValueError("message must be between 10 and 5000 characters")
        return v

# Schema for public (unauthenticated) ticket submission — includes name/email
class PublicTicketCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

    @field_validator('name', 'subject', 'message')
    @classmethod
    def not_blank(cls, v: str, info) -> str:
        if not v or not v.strip():
            raise ValueError(f"{info.field_name} cannot be empty")
        return v.strip()

    @field_validator('name')
    @classmethod
    def name_length(cls, v: str) -> str:
        if len(v) > 100:
            raise ValueError("name must be 100 characters or less")
        return v

    @field_validator('subject')
    @classmethod
    def subject_length(cls, v: str) -> str:
        if len(v) < 3 or len(v) > 200:
            raise ValueError("subject must be between 3 and 200 characters")
        return v

    @field_validator('message')
    @classmethod
    def message_length(cls, v: str) -> str:
        if len(v) < 10 or len(v) > 5000:
            raise ValueError("message must be between 10 and 5000 characters")
        return v

# Minimal confirmation response for public submissions — no AI fields exposed
class PublicTicketResponse(BaseModel):
    ticket_id: int
    status: str
    message: str

# Schema for updating a ticket's status
class TicketUpdateStatus(BaseModel):
    status: str

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {'open', 'in_progress', 'resolved', 'closed'}
        if v.lower() not in allowed:
            raise ValueError(f'Status must be one of {allowed}')
        return v.lower()

# Schema for assigning an agent to a ticket (admin only)
class TicketAssign(BaseModel):
    agent_id: int
    reason: str

    @field_validator('reason')
    @classmethod
    def validate_reason(cls, v: str) -> str:
        allowed = {'ai_suggested', 'manual', 'reassigned'}
        if v.lower() not in allowed:
            raise ValueError(f'Reason must be one of {allowed}')
        return v.lower()

# Schema for returning a ticket (what we send back to the client)
class Ticket(BaseModel):
    id: int
    customer_name: str
    customer_email: EmailStr
    subject: str
    message: str
    status: str
    category: Optional[str] = None
    urgency: Optional[str] = None
    sentiment: Optional[str] = None
    confidence: Optional[float] = None
    routing_reasoning: Optional[str] = None
    needs_review: Optional[bool] = None
    ai_draft_response: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    # Assignment fields
    assigned_agent_id: Optional[int] = None
    assigned_at: Optional[datetime] = None
    assignment_reason: Optional[str] = None
    ai_suggested_agent_id: Optional[int] = None
    # Nested agent object (populated when a relationship is loaded)
    assigned_agent: Optional[AgentBrief] = None

    class Config:
        from_attributes = True  # Allows Pydantic to read data from SQLAlchemy ORM models

# ─── Auth schemas ─────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    categories: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class GoogleAuthRequest(BaseModel):
    """Payload sent from the frontend after useGoogleLogin resolves with an OAuth2 access token."""
    access_token: str  # The Google OAuth2 access token (from useGoogleLogin implicit flow)

class GoogleToken(BaseModel):
    """Response shape for /auth/google — extends Token with the resolved user object."""
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None

# ─── Feedback schemas ─────────────────────────────────────────────────────────

class FeedbackCreate(BaseModel):
    ticket_id: int
    is_correct: bool
    correct_category: Optional[str] = None
    correct_urgency: Optional[str] = None
    feedback_note: Optional[str] = None

class FeedbackOut(BaseModel):
    id: int
    ticket_id: int
    agent_id: int
    is_correct: bool
    correct_category: Optional[str] = None
    correct_urgency: Optional[str] = None
    feedback_note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CategoryAccuracy(BaseModel):
    category: str
    total: int
    correct: int
    accuracy: float

class AccuracyMetrics(BaseModel):
    total_feedback: int
    correct_count: int
    incorrect_count: int
    accuracy_rate: float
    by_category: List[CategoryAccuracy]
