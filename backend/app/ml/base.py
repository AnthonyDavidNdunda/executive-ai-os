from dataclasses import dataclass, field
from typing import Protocol, Optional

@dataclass
class ForecastPoint:
    date: str       # ISO date, "2025-01-01"
    value: float    # predicted value
    lower: Optional[float] = None  # lower confidence bound, None if unsupported
    upper: Optional[float] = None  # upper confidence bound, None if unsupported


@dataclass
class ForecastResult:
    model_name: str
    metric: str             #revenue, cash_flow, etc.
    points: list[ForecastPoint]
    has_intervals: bool = False
    metadata: dict = field(default_factory=dict)

class Forecaster(Protocol):
    """Any forecasting model must satisfy this"""
    
    name: str
    
    def fit_predict(
        self, 
        history: list[dict],    #[{"date": "2020-01-01", "value": 778879},...]
        periods: int,
    ) -> ForecastResult:
        ...