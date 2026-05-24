from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, models
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Get overview statistics for the dashboard.
    """
    return crud.get_analytics_overview(db, user_id=current_user.id)

@router.get("/charts")
def get_analytics_charts(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Get data for dashboard charts.
    """
    return crud.get_analytics_charts(db, user_id=current_user.id)
