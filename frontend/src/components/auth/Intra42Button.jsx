import { ArrowUpRight } from "lucide-react";
import { mockEnabled } from "../../mocks/config";

export default function Intra42Button() {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
      {mockEnabled ? (
        <>
          <button
            type="button"
            disabled
            className="btn-secondary w-full opacity-50"
          >
            Continue with 42 <ArrowUpRight size={16} />
          </button>
          <p className="text-center text-xs text-muted">
            42 sign-in is available when demo mode is turned off.
          </p>
        </>
      ) : (
        <a href="/auth/42" className="btn-secondary w-full">
          Continue with 42 <ArrowUpRight size={16} />
        </a>
      )}
    </div>
  );
}
