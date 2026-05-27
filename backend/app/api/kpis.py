from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.kpi_service import parse_and_store_csv, get_summary, get_trends

router = APIRouter(prefix="/kpis", tags=["kpis"])

@router.post("/upload")
async def upload_kpis(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV Files can be uploaded.")
    
    try:
        contents = await file.read()
        result = parse_and_store_csv(contents, db)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail= f"An error occured while processing the file: {str(e)}")
    
    return JSONResponse(content = {"message": "File uploaded successfully", "Inserted": result["Inserted"]})

@router.get("/summary")
def kpi_summary(db: Session = Depends(get_db)):
    summary = get_summary(db)
    if not summary:
        return {"message": "No KPI data found"}
    return summary

@router.get("/trends")
def kpi_trends(db: Session = Depends(get_db)):
    return get_trends(db)

