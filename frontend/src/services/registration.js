import { register } from "./auth";

export async function submitRegistration({ email, password, confirmpassword }) {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    await register({ email: normalizedEmail, password, confirmpassword });
    return { email: normalizedEmail, resumed: false, retryAfter: 60 };
  } catch (error) {
    const pending =
      error.status === 409 &&
      error.message ===
        "Registration pending. Verify your email or request a new code.";
    const cooldown =
      error.status === 429 &&
      error.message === "Please wait before requesting another code.";
    if (!pending && !cooldown) throw error;
    return {
      email: normalizedEmail,
      resumed: true,
      retryAfter: Math.max(0, Number(error.retryAfter) || 0),
    };
  }
}
