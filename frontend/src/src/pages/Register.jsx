import RegisterForm from "../components/RegisterForm.jsx";
import { Link } from "react-router-dom";
import hat from '../assets/hat.svg'

export default function Register() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16 transition-colors duration-300 dark:bg-zinc-950">
            <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg shadow-zinc-900/5 transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40">

                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-3xl dark:bg-zinc-800">
                        <img src={hat} alt="" className="h-8 w-8 object-contain dark:brightness-0 dark:invert" />
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Create Account
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Start your learning journey with us.
                    </p>
                </div>

                <RegisterForm />

                <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-teal-600 hover:text-teal-700 hover:underline dark:text-teal-400 dark:hover:text-teal-300"
                    >
                        Sign in
                    </Link>
                </p>
            </section>
        </main>
    );
}