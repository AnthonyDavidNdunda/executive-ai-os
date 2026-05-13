"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Upload,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "AI Copilot", href: "/copilot", icon: MessageSquare },
  { label: "Uploads", href: "/uploads", icon: Upload },
  { label: "Forecasting", href: "/forecasting", icon: TrendingUp },
  { label: "Alerts", href: "/alerts", icon: AlertTriangle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-lg font-semibold text-white">Executive AI OS</h1>
        <p className="text-xs text-slate-400 mt-1">Decision Support Platform</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === href
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">v0.1.0 — Month 1</p>
      </div>
    </aside>
  );
}