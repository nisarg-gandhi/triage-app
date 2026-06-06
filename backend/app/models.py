from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    customer_name = Column(String(100), index=True)
    customer_email = Column(String(100), index=True)
    subject = Column(String(200))
    message = Column(Text)
    status = Column(String(50), default="open") # e.g., open, in_progress, resolved
    category = Column(String(50), nullable=True)
    urgency = Column(String(50), nullable=True)
    sentiment = Column(String(50), nullable=True)
    confidence = Column(Float, nullable=True)
    routing_reasoning = Column(Text, nullable=True)
    needs_review = Column(Boolean, default=False)
    ai_draft_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)

    # Agent assignment fields
    assigned_agent_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    assigned_at = Column(DateTime, nullable=True)
    # Values: "ai_suggested" | "manual" | "reassigned"
    assignment_reason = Column(String(50), nullable=True)
    # Stores the AI's recommendation separately for future feedback loops
    ai_suggested_agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="tickets", foreign_keys=[user_id])
    assigned_agent = relationship("User", foreign_keys=[assigned_agent_id])
    ai_suggested_agent = relationship("User", foreign_keys=[ai_suggested_agent_id])

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200))
    role = Column(String(20), default="user")
    # Ticket categories this agent handles (e.g. ["billing", "technical"])
    categories = Column(ARRAY(String), nullable=False, server_default="{}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tickets = relationship("Ticket", back_populates="user", foreign_keys="Ticket.user_id")


class ClassificationFeedback(Base):
    __tablename__ = "classification_feedback"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    is_correct = Column(Boolean, nullable=False)
    correct_category = Column(String(50), nullable=True)
    correct_urgency = Column(String(50), nullable=True)
    feedback_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    ticket = relationship("Ticket")
    agent = relationship("User")

    __table_args__ = (
        UniqueConstraint("ticket_id", "agent_id", name="unique_agent_ticket"),
    )
