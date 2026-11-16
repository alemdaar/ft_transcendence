import UserIdentity from './UserIdentity';
import { useState } from "react";
import { LogOut } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Button from "../ui/Button";

export default function AccountMenu({ compact = false, onSignedOut }) {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!user) return null;

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
      <UserIdentity user={user} compact={compact} />
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
