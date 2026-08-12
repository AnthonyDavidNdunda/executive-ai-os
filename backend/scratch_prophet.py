import pandas as pd
from prophet import Prophet

raw = pd.read_csv("../datasets/saas_kpis_60mo.csv")
df = pd.DataFrame({
    "ds": pd.to_datetime(raw["date"]),
    "y": raw["revenue"]
})

train = df.iloc[:48]
actual = df.iloc[48:]

model = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
model.fit(train)

future = model.make_future_dataframe(periods=12, freq="MS")
prediction = model.predict(future).iloc[48:]

comp = pd.DataFrame({
    "date": actual["ds"].dt.strftime("%Y-%m"),
    "actual": actual["y"].values,
    "predicted": prediction["yhat"].values,
})

comp["error_pct"] = (comp["predicted"] - comp["actual"])/ comp["actual"] * 100

print(comp.to_string(index=False, float_format=lambda x: f"{x:,.1f}"))
print()
print(f"MAPE: {comp['error_pct'].abs().mean():.2f}%")
print(f"MAPE excluding May: {comp[comp['date'] != '2024-05']['error_pct'].abs().mean():.2f}%")
