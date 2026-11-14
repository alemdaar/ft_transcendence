import { useState } from "react";
import { LogOut } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Button from "../ui/Button";

export default function AccountMenu({ compact = false, onSignedOut }) {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!user) return null;
  const name = user.displayname || user.username || user.email;
  async function handleLogout() {
    setLoading(true);
    setError("");
    try {
      await signOut();
      onSignedOut?.();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className={compact ? "flex items-center gap-2" : "space-y-3"}>
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-selected text-sm font-bold text-highlight"
          aria-hidden="true"
        >
          {name.slice(0, 2).toUpperCase()}
        </span>
        {!compact && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted">
              {user.campus} · {user.points ?? 0} points
            </p>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        disabled={loading}
        onClick={handleLogout}
        aria-label="Sign out"
      >
        <LogOut size={17} />
        {!compact && (loading ? "Signing out…" : "Sign out")}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
