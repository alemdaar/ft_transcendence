

import { useState } from "react";
import { useLocation, Link } from "react-router-dom";

export default function VerifyEmail() {
    const [code, setcode] = useState("");
    const location = useLocation();
    const email = location.state?.email;

    const [error, seterror] = useState("");
    const [success, setsuccess] = useState("");
    const [loading, setloading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        seterror("");
        setsuccess("");

        if (!email || !code) {
            seterror("Email and verification code are required.");
            return;
        }

        setloading(true);

        try {
            const response = await fetch(
                "/auth/verify-email",
                {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({ email, code }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                seterror(
                    result.message ||
                    result.error ||
                    "Verification failed. Please try again."
                );
            } else {
                setsuccess("Email verified successfully!");
            }
        } catch (error) {
            seterror("Cannot connect to the server.");
        } finally {
            setloading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-green-50 px-4 py-16 transition-colors dark:bg-green-950">
            <section className="w-full max-w-md rounded-2xl border border-green-100 bg-white p-8 shadow-lg shadow-green-900/5 transition-colors dark:border-green-800 dark:bg-green-900">

                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl dark:bg-green-800">
                        ✉️
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-green-800 dark:text-green-50">
                        Verify Your Email
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-green-100/70">
                        We've sent a verification code to your email.
                        Enter the code below to activate your account.
                    </p>

                    {email && (
                        <p className="mt-2 break-all text-sm font-medium text-green-700 dark:text-green-300">
                            {email}
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <p
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                        >
                            {error}
                        </p>
                    )}

                    {success && (
                        <p
                            role="status"
                            className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300"
                        >
                            {success}
                        </p>
                    )}

                    <div className="space-y-1.5">
                        <label
                            htmlFor="verification-code"
                            className="block text-sm font-medium text-gray-700 dark:text-green-100"
                        >
                            Verification code
                        </label>

                        <input
                            id="verification-code"
                            type="text"
                            placeholder="Enter your code"
                            value={code}
                            onChange={(e) => setcode(e.target.value)}
                            autoComplete="one-time-code"
                            required
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center tracking-widest text-gray-900 outline-none transition placeholder:tracking-normal focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-green-700 dark:bg-green-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-green-800"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-green-600 dark:hover:bg-green-500"
                    >
                        {loading ? "Verifying..." : "Verify email"}
                    </button>

                    <p className="text-center text-sm text-gray-600 dark:text-green-100/80">
                        Wrong email?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-green-700 hover:underline dark:text-green-300"
                        >
                            Register again
                        </Link>
                    </p>
                </form>
            </section>
        </main>
    );
}