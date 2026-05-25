import pandas as pd
from sqlalchemy import Session
from app.models.kpi import KPI


def parse_and_store_csv(file_bytes: bytes, db: Session) -> dict:
    df = pd.read_csv(pd.io.common.BytesIO(file_bytes))
    
    #Normalize column names
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

    required = {"date", "revenue", "expenses", "ebitda", "cash_flow"}
    if not required.issubset(set(df.columns)):
        missing = required - set(df.columns)
        raise ValueError(f"Missing required columns: {missing}")
    
    df["date"] = pd_to_datetime(df["date"]).dt.date

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

# Pick up here when you get back 
