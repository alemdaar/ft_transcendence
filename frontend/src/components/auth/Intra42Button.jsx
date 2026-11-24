import { ArrowUpRight } from "lucide-react";

export default function Intra42Button() {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
      <a
        href="/auth/42"
        onClick={() => sessionStorage.setItem("studypeer-login-method", "42")}
        className="btn-secondary w-full"
      >
        Continue with 42 <ArrowUpRight size={16} />
      </a>
    </div>
  );
}
