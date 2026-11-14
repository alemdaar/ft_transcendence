import LoginForm from "../components/auth/LoginForm.jsx";
import { Link } from "react-router-dom";
import hat from "../assets/hat.svg";

export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-16 transition-colors duration-300 ">
      <section className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-lg shadow-zinc-900/5 transition-colors duration-300   ">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-soft text-3xl ">
            <img
              src={hat}
              alt=""
              className="h-8 w-8 object-contain dark:brightness-0 dark:invert"
            />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-fg ">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-muted ">
            Sign in to continue your learning journey.
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted ">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-highlight hover:text-highlight-hover hover:underline  "
          >
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
