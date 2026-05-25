from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base


class KPI(Base):
    __tablename__ = "kpis"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    revenue = Column(Float, nullable=False)
    expenses = Column(Float, nullable=False)
    ebitda = Column(Float, nullable=False)
    cash_flow = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    