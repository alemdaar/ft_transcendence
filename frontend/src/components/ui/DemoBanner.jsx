import { mockEnabled } from "../../mocks/config";
import { resetDemo } from "../../mocks/store";

export default function DemoBanner() {
  if (!mockEnabled) return null;
  function reset() {
    resetDemo();
    window.location.reload();
  }
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 border-b border-success-line bg-selected px-4 py-2 text-xs text-highlight">
      <span>Demo mode · Local sample data · No backend requests</span>
      <button
        type="button"
        onClick={reset}
        className="rounded px-2 py-1 font-semibold underline focus-visible:outline-2"
      >
        Reset demo data
      </button>
    </div>
  );
}
