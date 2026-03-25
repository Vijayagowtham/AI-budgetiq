import { cn } from "../../utils/cn";

export function Button({ className, variant = "primary", size = "md", children, ...props }) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:from-primary-500 hover:to-accent-400 shadow-[0_4px_14px_0_rgba(99,102,241,0.39)]",
    secondary: "bg-slate-800 text-slate-50 hover:bg-slate-700 border border-slate-700/50",
    ghost: "text-slate-400 hover:text-slate-50 hover:bg-slate-800",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
  };
  
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
