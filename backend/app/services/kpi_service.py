import pandas as pd
from sqlalchemy.orm import Session
from app.models.kpi import KPI

def _pct_change(current: float, prior: float) -> float | None:
    if not prior:
        return None
    return round((current - prior) / prior * 100, 1)

def _margin(k) -> float:
    return round((k.ebitda / k.revenue * 100), 2) if k.revenue else 0.0

def get_derived_metrics(db: Session) -> dict:
    kpis = db.query(KPI).order_by(KPI.date).all()
    if len(kpis) < 2:
        return {}
    
    first, last, prev = kpis[0], kpis[-1], kpis[-2]
    mid = len(kpis) // 2
    h1, h2 = kpis[:mid], kpis[mid:]
    
    def average_margin(rows):
        return round(sum(_margin(k) for k in rows) / len(rows), 2) if rows else 0.0
    
    def expense_ratio(rows):
        rev = sum(k.revenue for k in rows)
        return round(sum(k.expenses for k in rows) / rev * 100, 2) if rev else 0.0
    
    best = max(kpis, key=_margin)
    worst = min(kpis, key=_margin)
    
    return {
        "latest_month": str(last.date), 
        "prior_month": str(prev.date),
        "mom": {
            "revenue_pct": _pct_change(last.revenue, prev.revenue),
            "ebitda_pct": _pct_change(last.ebitda, prev.ebitda),
            "expenses_pct": _pct_change(last.expenses, prev.expenses),
            "cash_flow_pct": _pct_change(last.cash_flow, prev.cash_flow), 
            "margin_bps": round((_margin(last) - _margin(prev)) * 100),
        },
        "full_period": {
            "start": str(first.date), 
            "end": str(last.date),
            "revenue_pct": _pct_change(last.revenue, first.revenue),
            "ebitda_pct": _pct_change(last.ebitda, first.ebitda),
            "expenses_pct": _pct_change(last.expenses, first.expenses),
            "margin_bps": round((_margin(last) - _margin(first)) * 100),
        },
        "best_margin_month": {"date": str(best.date), "margin": _margin(best)},
        "worst_margin_month": {"date": str(worst.date), "margin": _margin(worst)},
        "margin_spread_bps": round((_margin(best) - _margin(worst)) * 100),
        "halves": {
            "h1_average_margin": average_margin(h1),
            "h2_average_margin": average_margin(h2),
            "h1_expense_ratio": expense_ratio(h1), 
            "h2_expense_ratio": expense_ratio(h2),
            "margin_shift_bps": round((average_margin(h2) - average_margin(h1)) * 100),
        },
        "cash_conversion": {
            "latest_pct": round(last.cash_flow / last.ebitda * 100, 1) if last.ebitda else None,
            "period_avg_pct": round(
                sum(k.cash_flow for k in kpis) / sum(k.ebitda for k in kpis) * 100, 1
            ) if sum(k.ebitda for k in kpis) else None
        },
    }

def parse_and_store_csv(file_bytes: bytes, db: Session) -> dict:
    df = pd.read_csv(pd.io.common.BytesIO(file_bytes))
    
    #Normalize column names
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

    required = {"date", "revenue", "expenses", "ebitda", "cash_flow"}
    if not required.issubset(set(df.columns)):
        missing = required - set(df.columns)
        raise ValueError(f"Missing required columns: {missing}")
    
    df["date"] = pd.to_datetime(df["date"]).dt.date
    
    #Clear existing data before inserting new records
    db.query(KPI).delete()
    db.commit()

    records = []

    for _, row in df.iterrows():
        kpi = KPI(
            date = row["date"],
            revenue = float(row["revenue"]),
            expenses = float(row["expenses"]),
            ebitda = float(row["ebitda"]),
            cash_flow = float(row["cash_flow"])   
        )
        records.append(kpi)

    db.add_all(records)
    db.commit()

    return {"Inserted": len(records)}

def get_summary(db: Session) -> dict:
    kpis = db.query(KPI).all()
    if not kpis:
        return {"message": "No KPI data available."}
    
    revenues = [kpi.revenue for kpi in kpis]
    expenses = [kpi.expenses for kpi in kpis]
    ebitdas = [kpi.ebitda for kpi in kpis]
    cash_flows = [kpi.cash_flow for kpi in kpis]
    margins = [(kpi.ebitda / kpi.revenue * 100) if kpi.revenue else 0 for kpi in kpis]
    
    return {
        "total_revenue": sum(revenues),
        "total_expenses": sum(expenses),
        "total_ebitda": sum(ebitdas),
        "total_cash_flow": sum(cash_flows),
        "average_operating_margin": round(sum(margins) / len(margins), 2),
        "record_count": len(kpis)
    }
    
def get_trends(db: Session) -> list:
    kpis = db.query(KPI).order_by(KPI.date).all()
    return [
        {
            "date": str(kpi.date),
            "revenue": kpi.revenue,
            "expenses": kpi.expenses,
            "ebitda": kpi.ebitda,
            "cash_flow": kpi.cash_flow,
            "operating_margin": round((kpi.ebitda / kpi.revenue * 100) if kpi.revenue else 0, 2),
            "cash_conversion": round(kpi.cash_flow / kpi.ebitda * 100, 1) if kpi.ebitda else None
        }
        for kpi in kpis
    ]
