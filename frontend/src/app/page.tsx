import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";

const kpiCards = [
  {
    title: "Revenue",
    value: "$4.2M",
    change: "+12% YoY",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "EBITDA",
    value: "$1.1M",
    change: "-8% YoY",
    trend: "down",
    icon: Activity,
  },
  {
    title: "Operating Margin",
    value: "26.2%",
    change: "-4.1pts YoY",
    trend: "down",
    icon: TrendingDown,
  },
  {
    title: "Cash Flow",
    value: "$890K",
    change: "+5% YoY",
    trend: "up",
    icon: TrendingUp,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Performance Overview</h2>
        <p className="text-slate-400 text-sm mt-1">Q2 2025 — Executive Summary</p>
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

      {/* Placeholder for charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800 h-64 flex items-center justify-center">
          <p className="text-slate-600 text-sm">Revenue Trend Chart — Week 2</p>
        </Card>
        <Card className="bg-slate-900 border-slate-800 h-64 flex items-center justify-center">
          <p className="text-slate-600 text-sm">Margin Analysis Chart — Week 2</p>
        </Card>
      </div>

      {/* AI Insights placeholder */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-400">AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 text-sm">AI-generated executive summary will appear here — Week 3</p>
        </CardContent>
      </Card>
    </div>
  );
}