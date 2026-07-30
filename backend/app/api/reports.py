from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.report import ReportRequest, ReportResponse
from app.models.report import Report
from app.ai.report_service import generate_report, REPORT_TYPES


router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/types")
def list_report_types():
    return [{"id": k, "title": v["title"]} for k, v in REPORT_TYPES.items()]

@router.post("/generate", response_model=ReportResponse)
def create_report(request: ReportRequest, db: Session = Depends(get_db)):
    try:
        return generate_report(request.report_type, db)
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Report generation failed: {e}")
    
@router.get("/", response_model=list[ReportResponse])
def list_reports(db: Session = Depends(get_db)):
    return db.query(Report).order_by(Report.created_at.desc()).limit(50).all()

@router.delete("/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail = "Report not found")
    db.delete(report)
    db.commit()
    return {"message": "Report deleted"}