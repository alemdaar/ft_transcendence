import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { verifyEmail, resendCode } from "../../services/auth";

export default function VerifyEmailForm({ initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [code, setcode] = useState("");

  const [error, seterror] = useState("");
  const [verified, setVerified] = useState(false);
  const [success, setsuccess] = useState("");
  const [loading, setloading] = useState(false);
  const [coolDown, setCoolDown] = useState(email ? 60 : 0);

  useEffect(() => {
    if (coolDown <= 0) return;
    const timer = setTimeout(() => setCoolDown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [coolDown]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    seterror("");
    setsuccess("");
    if (!email || !/^\d{6}$/.test(code)) {
      seterror("Email and a six-digit verification code are required.");
      return;
    }
    setloading(true);
    try {
      await verifyEmail(email, code);
      setVerified(true);
      setsuccess("Email verified. You can now sign in.");
    } catch (error) {
      seterror(error.message);
    } finally {
      setloading(false);
    }
  }

  async function handleResend() {
    if (loading || coolDown > 0) return;
    seterror("");
    setsuccess("");
    if (!email) {
      seterror("Please enter your email address.");
      return;
    }
    setloading(true);
    try {
      await resendCode(email);
      setsuccess("A new code has been sent. Check your email.");
      setCoolDown(60);
    } catch (error) {
      seterror(error.message);
      if (error.retryAfter) setCoolDown(error.retryAfter);
    } finally {
      setloading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email address"
        id="verification-email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setVerified(false);
        }}
      />
      {verified && (
        <Link className="btn-secondary w-full" to="/login">
          Continue to sign in
        </Link>
      )}
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
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
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
  );
}
