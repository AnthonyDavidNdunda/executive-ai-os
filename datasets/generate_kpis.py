"""
Generate 60 months of synthetic B2B SaaS financial data (Jan 2020 - Dec 2024).

Profile: Seattle-based B2B SaaS company scaling from ~$850K to ~$4M monthly revenue.

Modeled characteristics:
  - Compounding growth that decelerates as the company matures
  - Q4 enterprise budget-flush seasonality, Q1 hangover
  - COVID demand shock in Q2 2020, followed by remote-work tailwind
  - Operating leverage: margins expand as revenue scales
  - Three deliberate anomalies for anomaly detection to find
"""

import csv
import math
import random
from datetime import date

random.seed(42)  # reproducible

START_YEAR, START_MONTH = 2020, 1
N_MONTHS = 60
BASE_REVENUE = 850_000

# Multiplicative seasonal factors by month (Jan=index 0).
# Q4 budget flush, Q1 slump, modest summer softness.
SEASONALITY = [
    0.93, 0.95, 1.02,   # Q1 - budget resets, slow start, March quarter-end push
    0.97, 0.99, 1.06,   # Q2 - quarter-end bump in June
    0.94, 0.93, 1.05,   # Q3 - summer softness, September quarter-end
    0.98, 1.02, 1.16,   # Q4 - budget flush, December peak
]

# Named events: month_index -> (revenue_multiplier, expense_multiplier, note)
EVENTS = {
    3:  (0.88, 1.00, "COVID demand shock - deals frozen"),
    4:  (0.91, 0.97, "COVID trough, cost containment"),
    5:  (0.96, 0.98, "partial recovery"),
    27: (1.00, 1.19, "ANOMALY: one-time platform migration cost"),
    41: (0.78, 1.04, "ANOMALY: enterprise churn event"),
    52: (1.26, 1.05, "ANOMALY: large multi-year contract closed"),
}


def month_iter(n):
    y, m = START_YEAR, START_MONTH
    for _ in range(n):
        yield date(y, m, 1)
        m += 1
        if m > 12:
            m, y = 1, y + 1


def growth_multiplier(i):
    """Compounding growth that decays over time - fast early, slower at scale."""
    early = 0.032   # ~3.2% monthly at month 0
    late = 0.011    # ~1.1% monthly by month 60
    rate = late + (early - late) * math.exp(-i / 24)
    return rate


def expense_ratio(i):
    """
    Expenses as a share of revenue. Starts high (growth-stage burn),
    improves with operating leverage, flattens as reinvestment resumes.
    """
    start, floor = 0.795, 0.665
    ratio = floor + (start - floor) * math.exp(-i / 30)
    return ratio


def cash_conversion(i):
    """Cash flow as a share of EBITDA. Improves as collections mature."""
    return min(0.90, 0.74 + 0.0028 * i)


rows = []
revenue = BASE_REVENUE

for i, d in enumerate(month_iter(N_MONTHS)):
    if i > 0:
        revenue *= 1 + growth_multiplier(i)

    seasonal = SEASONALITY[d.month - 1]
    noise = random.gauss(1.0, 0.022)

    rev_mult, exp_mult, _ = EVENTS.get(i, (1.0, 1.0, ""))

    monthly_revenue = revenue * seasonal * noise * rev_mult

    ratio = expense_ratio(i) * exp_mult * random.gauss(1.0, 0.014)
    expenses = monthly_revenue * ratio
    ebitda = monthly_revenue - expenses
    cash_flow = ebitda * cash_conversion(i) * random.gauss(1.0, 0.03)

    rows.append({
        "date": d.isoformat(),
        "revenue": round(monthly_revenue),
        "expenses": round(expenses),
        "ebitda": round(ebitda),
        "cash_flow": round(cash_flow),
    })

with open("saas_kpis_60mo.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["date", "revenue", "expenses", "ebitda", "cash_flow"])
    writer.writeheader()
    writer.writerows(rows)

# ---- Summary for sanity checking ----
first, last = rows[0], rows[-1]
margins = [(r["ebitda"] / r["revenue"] * 100) for r in rows]

print(f"Rows: {len(rows)}  ({first['date']} to {last['date']})")
print(f"Revenue: ${first['revenue']:,} -> ${last['revenue']:,}")
print(f"Margin:  {margins[0]:.1f}% -> {margins[-1]:.1f}%")
print(f"Margin range: {min(margins):.1f}% - {max(margins):.1f}%")
print()

print("Annual totals:")
for year in range(2020, 2025):
    yr = [r for r in rows if r["date"].startswith(str(year))]
    rev = sum(r["revenue"] for r in yr)
    eb = sum(r["ebitda"] for r in yr)
    print(f"  {year}: revenue ${rev/1e6:>5.1f}M   ebitda ${eb/1e6:>4.1f}M   margin {eb/rev*100:>4.1f}%")
print()

print("Avg revenue by calendar month (seasonality check):")
for m in range(1, 13):
    vals = [r["revenue"] for r in rows if int(r["date"][5:7]) == m]
    label = date(2020, m, 1).strftime("%b")
    print(f"  {label}: ${sum(vals)/len(vals)/1e6:.2f}M")
print()

print("Planted events:")
for idx, (rm, em, note) in sorted(EVENTS.items()):
    print(f"  {rows[idx]['date']}  {note}")
