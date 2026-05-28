"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Activity, Icon, Car } from "lucide-react";
import  { getKPISummary, getKPITrends } from "@/services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, trendsRes] = await Promise.all([
          getKPISummary(),
          getKPITrends(),
        ]);
        setSummary(summaryRes.data);
        setTrends(trendsRes.data);
      } catch (error) {
        console.error("Error fetching KPI data: ", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatMillions = (val: number) => val >= 1e6 ? `$${(val / 1e6).toFixed(1)}M` : `$${(val / 1000).toFixed(0)}K`;  

  const kpiCards = summary
  ? [
      {
        title: "Total Revenue",
        value: formatMillions(summary.total_revenue),
        change: `${summary.record_count} months of data`,
        trend: "up",
        icon: DollarSign,
      },
      {
        title: "Total EBITDA",
        value: formatMillions(summary.total_ebitda),
        change: `${summary.average_operating_margin ?? "N/A"}% avg margin`,
        trend: "up",
        icon: Activity,
      },
      {
        title: "Total Expenses",
        value: formatMillions(summary.total_expenses),
        change: "Operating Expenses",
        trend: "down",
        icon: TrendingDown,
      },
      {
        title: "Total Cash Flow",
        value: formatMillions(summary.total_cash_flow),
        change: "Net cash position",
        trend: "up",
        icon: TrendingUp,
      },
    ]
  : [];
  
  const chartData = trends.map((t) => ({
    date: t.date.slice(0, 7),
    Revenue: (t.revenue / 1000000).toFixed(2),
    Expenses: (t.expenses / 1000000).toFixed(2),
    EBITDA: (t.ebitda / 1000000).toFixed(2),
    Margin: t.operating_margin,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Performance Overview</h2>
        <p className="text-slate-400 text-sm mt-1">2024 -- Executive Summary</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map(({ title, value, change, trend, icon: Icon }) => (
          <Card key={title} className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {title}
              </CardTitle>
              <Icon size={16} className="text-slate-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className={`text-xs mt-1 ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                {change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/*Revenue and Expenses Trends Chart */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-400">
            Revenue vs Expenses ($ Millions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 12}} />
              <YAxis stroke="#475569" tick={{ fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Legend />
              <Line type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="EBITDA" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Margin Chart */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-400">
            Operating Margin (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solids #1e293b" }}
                labelStyle={{ color: "94a3b8 "}}
              />
              <Line type="monotone" dataKey="Margin" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}