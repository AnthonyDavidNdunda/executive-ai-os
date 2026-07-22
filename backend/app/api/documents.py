from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.document import DocumentResponse
from app.models.document import Document
from app.ai.embedding_service import process_and_store_document

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith("pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    try:
        contents = await file.read()
        result = process_and_store_document(contents, file.filename, db)
    except ValueError as e: 
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    return JSONResponse(content={
        "message": "Document uploaded successfully",
        "document_id": result["document_id"],
        "chunks": result["chunks"]
    })
    
@router.get("/", response_model=list[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).order_by(Document.created_at.desc()).all()

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}

#temporary debug search
@router.get("/search")
def search_docs(query: str, db: Session = Depends(get_db)):
    from app.ai.retrieval_service import search_documents
    try:
        results = search_documents(query, db)
        return {"results": results, "count": len(results)}
    except Exception as e:
        return {"error": str(e)}
