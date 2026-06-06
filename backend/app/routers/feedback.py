from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from .. import schemas, crud, models
from ..dependencies import get_db, require_role

router = APIRouter(
    prefix="/feedback",
    tags=["feedback"],
)


@router.post("/", response_model=schemas.FeedbackOut)
def submit_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("agent")),
):
    """
    Submit AI classification feedback for a ticket (agent only).
    Raises 400 if the agent has already submitted feedback for this ticket.
    """
    return crud.submit_feedback(
        db=db,
        ticket_id=feedback.ticket_id,
        agent_id=current_user.id,
        feedback=feedback,
    )


@router.get("/metrics", response_model=schemas.AccuracyMetrics)
def get_accuracy_metrics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    """
    Return overall AI classification accuracy and a per-category breakdown (admin only).
    """
    return crud.get_accuracy_metrics(db=db)


@router.get("/ticket/{ticket_id}", response_model=Optional[schemas.FeedbackOut])
def get_feedback_for_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("agent")),
):
    """
    Return the current agent's existing feedback for a ticket, or null if none exists.
    Used by the frontend to determine whether to show the feedback form.
    """
    feedback = crud.get_agent_feedback_for_ticket(
        db=db,
        ticket_id=ticket_id,
        agent_id=current_user.id,
    )
    return feedback
