import { cn } from "../../utils/cn";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-slate-900/60 border border-slate-700/50 rounded-xl shadow-lg backdrop-blur-sm transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
