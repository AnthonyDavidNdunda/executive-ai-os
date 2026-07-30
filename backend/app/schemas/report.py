from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReportRequest(BaseModel):
    report_type: str
    
class ReportResponse(BaseModel):
    id: int
    report_type: str
    title: str
    content: str
    sources: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
        