
import LoginForm from "../components/LoginForm.jsx";
import { Link } from "react-router-dom";
import hat from '../assets/hat.svg'

export default function Login() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-16 transition-colors dark:bg-green-950">
            <section className="w-full max-w-md rounded-2xl border border-green-100 bg-white p-8 shadow-lg shadow-green-900/5 transition-colors dark:border-green-800 dark:bg-green-900">
                
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ">
                        <img src={hat} alt="" />
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-green-800 dark:text-green-50">
                        Welcome Back
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-green-100/70">
                        Sign in to continue your learning journey.
                    </p>
                </div>

                <LoginForm />

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-green-100/80">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-green-700 hover:text-green-900 hover:underline dark:text-green-300 dark:hover:text-white"
                    >
                        Sign up
                    </Link>
                </p>
            </section>
        </main>
    );
}
