import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function VerifyEmail() {
  const [code, setcode] = useState("");
  const location = useLocation();
  const email = location.state?.email;

  const [error, seterror] = useState("");
  const [success, setsuccess] = useState("");
  const [loading, setloading] = useState(false);
  const [coolDown, setCoolDown] = useState(email ? 60 : 0);

  useEffect(() => {
    if (coolDown <= 0) return;
    const timer = setTimeout(() => setCoolDown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, coolDown);

  const handleSubmit = async (e) => {
    e.preventDefault();
    seterror("");
    setsuccess("");

    if (!email || !code) {
      seterror("Email and verification code are required.");
      return;
    }

    setloading(true);

    try {
      const response = await fetch("/auth/verify-email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();

      if (!response.ok) {
        seterror(
          result.message ||
            result.error ||
            "Verification failed. Please try again.",
        );
      } else {
        setsuccess("Email verified successfully!");
      }
    } catch (error) {
      seterror("Cannot connect to the server.");
    } finally {
      setloading(false);
    }
  };
  const handleResend = async (e) => {
    e.preventDefault();

    if (coolDown > 0) return;
    if (!email) {
      seterror("Email is missing. Please register again.");
      return;
    }
    seterror("");
    setsuccess("");
    setloading(true);
    try {
      const response = await fetch("/auth/resend-code", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const resulte = await response.json();
      if (response.status === 429) setCoolDown(resulte.retryAfter || 60);
      else if (!response.ok) seterror(resulte.message);
      else {
        setsuccess("code resend seccessfully check your email");
        setCoolDown(60);
      }
    } catch (error) {
      seterror("can't connect to server");
    } finally {
      setloading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-16 transition-colors duration-300 ">
      <section className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-lg shadow-zinc-900/5 transition-colors duration-300   ">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-fg ">
            Verify Your Email
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted ">
            We've sent a verification code to your email. Enter the code below
            to activate your account.
          </p>

          {email && (
            <p className="mt-2 break-all text-sm font-medium text-highlight ">
              {email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-danger-line bg-danger-soft p-3 text-sm text-danger   "
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-xl border border-success-line bg-selected p-3 text-sm text-success   "
            >
              {success}
            </p>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="verification-code"
              className="block text-sm font-medium text-fg "
            >
              Verification code
            </label>

            <input
              id="verification-code"
              type="text"
              placeholder="Enter your code"
              value={code}
              onChange={(e) => setcode(e.target.value)}
              autoComplete="one-time-code"
              required
              className="input text-center font-semibold tracking-widest placeholder:font-normal placeholder:tracking-normal"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Verifying..." : "Verify email"}
          </Button>

          <p className="text-xs text-muted ">
            Didn't receive it?{" "}
            <button
              type="button"
              disabled={loading || coolDown > 0}
              onClick={handleResend}
              className="cursor-pointer font-semibold text-highlight transition hover:text-highlight-hover hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline  "
            >
              {coolDown > 0 ? `Resend in ${coolDown}s` : "Resend"}
            </button>
          </p>

          <p className="text-center text-sm text-muted ">
            Wrong email?{" "}
            <Link
              to="/register"
              className="cursor-pointer font-semibold text-highlight hover:text-highlight-hover hover:underline  "
            >
              Register again
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
