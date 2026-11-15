import { useEffect } from "react";
import { X } from "lucide-react";

export default function SuccessNotice({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div
      role="status"
      className="flex items-start justify-between gap-3 rounded-xl border border-success-line bg-selected p-3 text-sm text-success"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
}
