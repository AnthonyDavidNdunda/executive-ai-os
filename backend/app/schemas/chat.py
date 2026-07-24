from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    id: int
    user_message: str
    ai_response: str
    sources: Optional[str] = None  # Optional field for sources
    created_at: datetime

    class Config: 
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str