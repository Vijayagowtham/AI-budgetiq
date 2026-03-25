import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "../../utils/cn";

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    bar: "bg-emerald-500",
    iconColor: "text-emerald-400",
    bg: "bg-slate-900 border-emerald-500/30",
    title: "Success",
  },
  error: {
    icon: XCircle,
    bar: "bg-red-500",
    iconColor: "text-red-400",
    bg: "bg-slate-900 border-red-500/30",
    title: "Error",
  },
  warning: {
    icon: AlertTriangle,
    bar: "bg-amber-400",
    iconColor: "text-amber-400",
    bg: "bg-slate-900 border-amber-400/30",
    title: "Warning",
  },
  info: {
    icon: Info,
    bar: "bg-primary-500",
    iconColor: "text-primary-400",
    bg: "bg-slate-900 border-primary-500/30",
    title: "Info",
  },
};

export function Toast({ id, message, type = "info", duration = 4000, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const variant = VARIANTS[type] || VARIANTS.info;
  const Icon = variant.icon;

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(id), 280);
  };

  useEffect(() => {
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-sm w-full rounded-xl border shadow-2xl shadow-black/40 p-4 backdrop-blur-sm",
        variant.bg,
        exiting ? "animate-slide-out-right" : "animate-slide-in-right"
      )}
      role="alert"
    >
      {/* Accent bar */}
      <div className={cn("w-1 shrink-0 self-stretch rounded-full", variant.bar)} />

      <Icon size={20} className={cn("shrink-0 mt-0.5", variant.iconColor)} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100">{variant.title}</p>
        <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{message}</p>
      </div>

      <button
        onClick={dismiss}
        className="shrink-0 p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors focus:outline-none"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
