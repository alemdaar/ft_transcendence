import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Button from "../ui/Button";

export default function RequireAuth() {
  const { user, loading, error, retry } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <p role="status" className="p-12 text-center text-muted">
        Loading your session…
      </p>
    );
  if (error)
    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-4 p-6"
      >
        <p className="text-danger">{error}</p>
        <Button onClick={retry}>Try again</Button>
      </div>
    );
  if (!user)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <Outlet />;
}
