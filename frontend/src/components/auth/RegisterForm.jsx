import { submitRegistration } from "../../services/registration";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import hideIcon from "../../assets/hide.svg";
import showIcon from "../../assets/show.svg";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function RegisterForm() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [confirmpassword, setconfirmpassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();
  const [showpassword, setshowpassword] = useState(false);
  const [showConfirmpassword, setshowConfirmpassword] = useState(false);

  const handleEmail = (e) => setemail(e.target.value);
  const handlePassword = (e) => setpassword(e.target.value);

  const handleConfirmPassword = (e) => setconfirmpassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmpassword) {
      setError("Passwords do not match.");
      return;
    }
    const data = {
      email,
      password,
      confirmpassword,
    };
    setloading(true);
    try {
      const verification = await submitRegistration(data);
      navigate("/verify-email", { state: verification });
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setloading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-danger-line bg-danger-soft p-3 text-sm text-danger   "
        >
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="register-email"
          className="block text-sm font-medium text-fg "
        >
          Email address
        </label>

        <Input
          id="register-email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={handleEmail}
          autoComplete="email"
          required
          className="w-full"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-fg "
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="register-password"
            type={showpassword ? "text" : "password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={handlePassword}
            autoComplete="new-password"
            required
            className="w-full"
          />
          <button
            type="button"
            onClick={() => setshowpassword(!showpassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition hover:bg-soft "
          >
            <img
              src={showpassword ? hideIcon : showIcon}
              alt=""
              className="h-5 w-5 opacity-70 hover:opacity-100 dark:brightness-0 dark:invert dark:opacity-90"
            />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="register-confirm-password"
          className="block text-sm font-medium text-fg "
        >
          Confirm password
        </label>
        <div className="relative">
          <Input
            id="register-confirm-password"
            type={showConfirmpassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmpassword}
            onChange={handleConfirmPassword}
            autoComplete="new-password"
            required
            className="w-full"
          />
          <button
            type="button"
            onClick={() => setshowConfirmpassword(!showConfirmpassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition hover:bg-soft "
          >
            <img
              src={showConfirmpassword ? hideIcon : showIcon}
              alt=""
              className="h-5 w-5 opacity-70 hover:opacity-100 dark:brightness-0 dark:invert dark:opacity-90"
            />
          </button>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted">
        Already registered but not verified?{" "}
        <Link
          to="/verify-email"
          state={{
            email: email.trim().toLowerCase(),
            resumed: true,
            retryAfter: 0,
          }}
          className="font-semibold text-highlight hover:underline"
        >
          Verify email
        </Link>
      </p>
    </form>
  );
}
