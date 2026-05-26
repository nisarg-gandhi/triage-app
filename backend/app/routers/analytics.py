from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, models
from ..database import get_db
from ..dependencies import get_current_user, require_role

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db), current_user: models.User = Depends(require_role("admin", "agent"))):
    """
    Get overview statistics for the dashboard.
    """
    return crud.get_analytics_overview(db, user_id=current_user.id, role=current_user.role)

@router.get("/charts")
def get_analytics_charts(db: Session = Depends(get_db), current_user: models.User = Depends(require_role("admin", "agent"))):
    """
    Get data for dashboard charts.
    """
    return crud.get_analytics_charts(db, user_id=current_user.id, role=current_user.role)
