import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "../../utils/cn";

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", confirmVariant = "danger" }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    // Focus cancel button for safety (destructive actions)
    setTimeout(() => cancelRef.current?.focus(), 50);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const confirmStyles = {
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-red-500/20 shadow-md",
    warning: "bg-amber-500 hover:bg-amber-400 text-white",
    primary: "bg-primary-600 hover:bg-primary-500 text-white",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>

          <h3 className="text-lg font-semibold text-slate-50 mb-2">
            {title || "Are you sure?"}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {message || "This action cannot be undone."}
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            ref={cancelRef}
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={cn(
              "flex-1 h-10 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
              confirmStyles[confirmVariant] || confirmStyles.danger,
              confirmVariant === "danger" && "focus:ring-red-500",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
