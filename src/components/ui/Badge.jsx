import { cn } from "../../utils/cn";

export function Badge({ className, variant = "default", children, ...props }) {
  const variants = {
    default: "bg-slate-800 text-slate-300",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20",
    primary: "bg-primary-500/10 text-primary-400 border border-primary-500/20",
    accent: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
