from pydantic import BaseModel
from datetime import date

class KPIRecord(BaseModel):
    date: date
    revenue: float
    expenses: float
    ebitda: float
    cash_flow: float

    class Config: 
        from_attributes = True


class KPISummary(BaseModel):
    total_revenue: float
    total_expenses: float
    total_ebitda: float
    avg_operating_margin: float
    record_count: int