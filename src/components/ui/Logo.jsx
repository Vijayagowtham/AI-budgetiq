import { LineChart } from "lucide-react";

export function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg">
        <LineChart size={18} className="text-white" strokeWidth={2.5} />
      </div>
      <span className="text-xl tracking-tight font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-50 to-slate-400">
        BudgetAI
      </span>
    </div>
  );
}
