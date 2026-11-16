import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import UserIdentity from "./UserIdentity";

export default function HeaderAccount() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <span role="status" className="text-xs text-muted">
        Loading…
      </span>
    );
  if (user) return <UserIdentity user={user} compact />;
  return (
    <Link to="/login" className="btn-secondary">
      Sign in
    </Link>
  );
}
