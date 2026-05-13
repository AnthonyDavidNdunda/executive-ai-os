import { Bell, User } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <div>
        <p className="text-sm text-slate-400">Welcome back</p>
        <p className="text-base font-medium text-white">Executive Dashboard</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-white transition-colors">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
          <User size={16} className="text-slate-400" />
          <span className="text-sm text-slate-300">Admin</span>
        </div>
      </div>
    </header>
  );
}