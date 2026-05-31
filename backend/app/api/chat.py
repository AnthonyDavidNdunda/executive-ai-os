from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.ai.chat_service import ask_ai, save_message
from app.models.chat import ChatMessage

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/message", response_model=ChatResponse)
def send_message(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        ai_response = ask_ai(request.message, db)
        chat = save_message(request.message, ai_response, db)
        return chat
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")
    
@router.get("/history", response_model=list[ChatResponse])
def get_history(db: Session = Depends(get_db)):
    return db.query(ChatMessage).order_by(ChatMessage.created_at_desc()).limit(20).all()
