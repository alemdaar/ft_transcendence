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
  const [success, setsuccess] = useState(false);
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();
  const [showpassword, setshowpassword] = useState(false);
  const [showConfirmpassword, setshowConfirmpassword] = useState(false);

  const handleEmail = (e) => setemail(e.target.value);
  const handlePassword = (e) => setpassword(e.target.value);

  const handleConfirmPassword = (e) => setconfirmpassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setsuccess(false);
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    const data = {
      email,
      password,
      confirmpassword,
    };
    setloading(true);
    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok)
        setError(
          result.message ||
            result.error ||
            "Registeration failed. Please try again",
        );
      else {
        setsuccess(true);
        navigate("/verify-email", { state: { email } });
      }
    } catch (error) {
      setError("Cannot connect to the server.");
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

      {success && (
        <p className="rounded-xl border border-success-line bg-selected p-3 text-sm text-success   ">
          Account created successfully!
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
    </form>
  );
}
