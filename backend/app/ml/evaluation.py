from dataclasses import dataclass
from app.ml.base import Forecaster

@dataclass
class BacktestResult:
    model_name: str
    metric: str
    mape: float
    holdout_months: int
    worst_month: str
    worst_error_pct: float
    mape_excluding_worst_month: float
    detail: list[dict]

def backtest(forecaster: Forecaster, history: list[dict], holdout: int = 12, metric: str = "revenue") -> BacktestResult:
    """Train on all but the last 'holdout' months, predict them, measure error."""
    if len(history) < holdout + 24:
        raise ValueError(
            f"Need at least {holdout + 24} months to backtest with a {holdout}-month holdout"
        )
    train, actual = history[:-holdout], history[-holdout:]
    result = forecaster.fit_predict(train, periods=holdout, metric=metric)

    detail = []
    for act, pred in zip(actual, result.points):
        error_pct = (pred.value - act["value"]) / act["value"] * 100
        detail.append({
            "date": act["date"],
            "actual": act["value"],
            "predicted": pred.value,
            "error_pct": round(error_pct, 2),
        })

    errors = [abs(d["error_pct"]) for d in detail]
    mape = sum(errors) / len(errors)

    worst_idx = errors.index(max(errors))
    remaining = [e for i, e in enumerate(errors) if i != worst_idx]

    return BacktestResult(
        model_name = result.model_name,
        metric = metric,
        mape = round(mape, 2),
        holdout_months = holdout,
        worst_month = detail[worst_idx]["date"],
        worst_error_pct = detail[worst_idx]["error_pct"],
        mape_excluding_worst_month = round(sum(remaining) / len(remaining), 2),
        detail = detail,
    )