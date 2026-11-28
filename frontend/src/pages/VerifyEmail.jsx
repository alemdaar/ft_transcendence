import { useLocation } from "react-router-dom";
import VerifyEmailForm from "../components/auth/VerifyEmailForm";

export default function VerifyEmail() {
  const { state } = useLocation();
  const email = typeof state?.email === "string" ? state.email : "";
  const cooldown = Number.isFinite(state?.retryAfter)
    ? Math.max(0, state.retryAfter)
    : 0;
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-16">
      <section className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Verify Your Email
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            {state?.resumed
              ? "Your registration is waiting for email verification. Enter your code or request a new one."
              : "Enter your student email and the six-digit verification code. You can request a new code below."}
          </p>
        </div>
        <VerifyEmailForm
          key={email}
          initialEmail={email}
          initialCooldown={cooldown}
        />
      </section>
    </main>
  );
}
