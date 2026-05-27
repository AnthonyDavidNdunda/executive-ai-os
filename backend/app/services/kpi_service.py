import pandas as pd
from sqlalchemy.orm import Session
from app.models.kpi import KPI


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
            "operating_margin": round((kpi.ebitda / kpi.revenue * 100) if kpi.revenue else 0, 2)
        }
        for kpi in kpis
    ]
