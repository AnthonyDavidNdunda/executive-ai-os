from pydantic import BaseModel
from datetime import datetime

class DocumentResponse(BaseModel):
    id: int
    filename: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class DocumentChunkResponse(BaseModel):
    id: int
    document_id: int
    chunk_text: str
    chunk_index: int
    
    class Config:
        from_attributes = True