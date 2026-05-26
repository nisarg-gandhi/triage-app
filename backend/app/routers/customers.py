from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, models
from ..database import get_db
from ..dependencies import get_current_user, require_role

router = APIRouter(
    prefix="/customers",
    tags=["customers"],
)

@router.get("/")
def get_customers(db: Session = Depends(get_db), current_user: models.User = Depends(require_role("admin", "agent"))):
    """
    Get aggregated customer data based on existing tickets.
    """
    return crud.get_aggregated_customers(db, user_id=current_user.id, role=current_user.role)
