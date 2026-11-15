import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import hideIcon from "../../assets/hide.svg";
import showIcon from "../../assets/show.svg";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setshowPassword] = useState(false);

  const handleChange = (e) => setEmail(e.target.value);
  const handlePass = (e) => setPassword(e.target.value);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (!email && !password) {
      setError("Please enter email and password");
      return;
    }
    if (!email.includes("@")) {
      setError("Please include '@' in email Address");
      return;
    }
    if (password.length < 8) {
      setError("Password should contain at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      navigate("/", { replace: true });
    } catch (error) {
      setError(error.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="mb-4 rounded-xl border border-danger-line bg-danger-soft p-3 text-sm text-danger   ">
          {error}
        </p>
      )}

      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={handleChange}
        className="w-full "
      />
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={handlePass}
          className="w-full "
        />
        <button
          type="button"
          onClick={() => setshowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition hover:bg-soft "
        >
          <img
            src={showPassword ? hideIcon : showIcon}
            alt=""
            className="h-5 w-5 opacity-70 hover:opacity-100 dark:brightness-0 dark:invert dark:opacity-90"
          />
        </button>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "login in.." : "Login"}
      </Button>
    </form>
  );
}
