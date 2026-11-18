import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import * as auth from "../services/auth";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadSession() {
      setLoading(true);
      setError("");
      try {
        const user = await auth.getCurrentUser(controller.signal);
        if (!controller.signal.aborted) setUser(user);
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadSession();
    return () => controller.abort();
  }, [revision]);

  async function signIn(email, password) {
    const data = await auth.login(email.trim().toLowerCase(), password);
    setUser(data.user);
    setError("");
  }
  async function signOut() {
    await auth.logout();
    setUser(null);
  }
  function retry() {
    setRevision((value) => value + 1);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signOut, retry }}
    >
      {children}
    </AuthContext.Provider>
  );
}
