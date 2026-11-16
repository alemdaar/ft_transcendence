import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { mockEnabled } from "./config";
import { resetDemo } from "./store";

export default function DemoBanner() {
  const { retry } = useAuth();
  const [account, setAccount] = useState(
    () => sessionStorage.getItem("studypeer-demo-account") || "password",
  );
  function changeAccount(event) {
    setAccount(event.target.value);
    sessionStorage.setItem("studypeer-demo-account", event.target.value);
    sessionStorage.removeItem("studypeer-demo-signed-out");
    retry();
  }
  if (!mockEnabled) return null;
  function reset() {
    resetDemo();
    window.location.reload();
  }
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 border-b border-success-line bg-selected px-4 py-2 text-xs text-highlight">
      <label className="flex items-center gap-2">
        Test account
        <select
          aria-label="Demo account type"
          value={account}
          onChange={changeAccount}
          className="rounded border border-line bg-surface px-2 py-1 text-fg"
        >
          <option value="password">Username account</option>
          <option value="42">Intra 42 photo</option>
        </select>
      </label>
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
