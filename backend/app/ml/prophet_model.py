import logging
import pandas as pd
from prophet import Prophet

from app.ml.base import ForecastPoint, ForecastResult

logger = logging.getLogger(__name__)

class ProphetForecaster:
    name = "prophet"
    
    def __init__(self, changepoint_prior_scale: float = 0.05):
        self.changepoint_prior_scale = changepoint_prior_scale
        
    def _build_model(self) -> Prophet:
        return Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            changepoint_prior_scale = self.changepoint_prior_scale,
        )
    
    def fit_predict(self, history: list[dict], periods: int, metric: str = "revenue") -> ForecastResult:
        if len(history) < 24:
            raise ValueError(
                f"Prophet needs at least 24 months to fit yearly seasonality; got {len(history)} months"
            )
        
        df = pd.DataFrame({
            "ds": pd.to_datetime([h["date"] for h in history]),
            "y": [h["value"] for h in history],
        })
        
        model = self._build_model()
        model.fit(df)
        
        future = model.make_future_dataframe(periods=periods, freq="MS")
        forecast = model.predict(future).iloc[len(df):]
        
        points = [
            ForecastPoint(
                date=row.ds.strftime("%Y-%m-%d"),
                value=round(float(row.yhat), 2),
                lower=round(float(row.yhat_lower), 2),
                upper=round(float(row.yhat_upper), 2),
            )
            for row in forecast.itertuples()
        ]
        
        return ForecastResult(
            model_name=self.name,
            metric=metric,
            points=points,
            has_intervals=True,
            metadata={"training_months": len(df)},
        )
    
