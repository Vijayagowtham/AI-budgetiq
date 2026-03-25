import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "../../utils/cn";
import { Card } from "./Card";

export function Modal({ isOpen, onClose, title, children, className }) {
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-colors"
        onClick={onClose}
      />
      <div className={cn("relative z-50 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200", className)}>
        <Card className="flex flex-col gap-4 p-6 shadow-2xl border-slate-700/80">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          <div>{children}</div>
        </Card>
      </div>
    </div>
  );
}
