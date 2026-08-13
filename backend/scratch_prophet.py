import sys
sys.path.insert(0, ".")

from app.ml.prophet_model import ProphetForecaster
from app.ml.evaluation import backtest
import pandas as pd

raw = pd.read_csv("../datasets/saas_kpis_60mo.csv")
history = [{"date": r.date, "value": float(r.revenue)} for r in raw.itertuples()]

result = backtest(ProphetForecaster(), history, holdout=12)
print(f"{result.model_name}: MAPE {result.mape}%")
print(f"Worst: {result.worst_month} at {result.worst_error_pct}%")
print(f"Excluding worst: {result.mape_excluding_worst_month}%")