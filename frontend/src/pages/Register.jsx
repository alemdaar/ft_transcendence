import RegisterForm from "../components/auth/RegisterForm.jsx";
import { Link } from "react-router-dom";
import hat from "../assets/hat.svg";

export default function Register() {
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
            Create Account
          </h1>

          <p className="mt-2 text-sm text-muted ">
            Start your learning journey with us.
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-muted ">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-highlight hover:text-highlight-hover hover:underline  "
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
