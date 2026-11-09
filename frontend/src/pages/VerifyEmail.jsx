import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Button from "../components/ui/Button";


export default function VerifyEmail() {
    const [code, setcode] = useState("");
    const location = useLocation();
    const email = location.state?.email;

    const [error, seterror] = useState("");
    const [success, setsuccess] = useState("");
    const [loading, setloading] = useState(false);
    const [coolDown, setCoolDown] = useState(email ? 60 : 0);

    useEffect(() => {
        if (coolDown <= 0) return;
        const timer = setTimeout(() => setCoolDown((c) => c - 1 ), 1000);
        return () => clearTimeout(timer);
    }, [coolDown]);

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
        } catch {
            seterror("Cannot connect to the server.");
        } finally {
            setloading(false);
        }
    };
    const handleResend = async (e) => {
        e.preventDefault();

        if (coolDown > 0) return ;
        if (!email) {
            seterror("Email is missing. Please register again.");
            return;
        }
        seterror("");
        setsuccess("");
        setloading(true);
        try {
            const response = await fetch ('/auth/resend-code', {
                method: 'POST', 
                headers :{
                    "content-type" : "application/json"
                }, 
                body: JSON.stringify({ email })
            })
            const resulte = await response.json();
            if (response.status === 429)
                setCoolDown(resulte.retryAfter || 60);
            else if (!response.ok)
                seterror(resulte.error || resulte.message || "Unable to resend the code. Please try again.");
            else
            {
                setsuccess("code resend seccessfully check your email");
                setCoolDown(60);
            }

        } catch {
            seterror("can't connect to server");
        }
        finally { setloading(false)}
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16 transition-colors duration-300 dark:bg-zinc-950">
            <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg shadow-zinc-900/5 transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40">

                <div className="mb-8 text-center">

                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Verify Your Email
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        We've sent a verification code to your email.
                        Enter the code below to activate your account.
                    </p>

                    {email && (
                        <p className="mt-2 break-all text-sm font-medium text-teal-600 dark:text-teal-400">
                            {email}
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <p
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300"
                        >
                            {error}
                        </p>
                    )}

                    {success && (
                        <p
                            role="status"
                            className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/50 dark:text-teal-300"
                        >
                            {success}
                        </p>
                    )}

                    <div className="space-y-1.5">
                        <label
                            htmlFor="verification-code"
                            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
                            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-center text-sm font-semibold tracking-widest text-zinc-900 outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-teal-500 dark:focus:bg-zinc-800 dark:focus:ring-teal-500/20"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading} 
                        className="w-full"
                        >
                        {loading ? "Verifying..." : "Verify email"}
                        
                    </Button>
                    {/* Resend code */}
                        
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Didn't receive it?{" "}
                        <button
                            type="button"
                            disabled={loading || coolDown > 0}
                            onClick={handleResend}
                            className="cursor-pointer font-semibold text-teal-600 transition hover:text-teal-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline dark:text-teal-400 dark:hover:text-teal-300"
                        >
                            {coolDown > 0 ? `Resend in ${coolDown}s` : "Resend"}
                        </button>
                    </p>


                    {/* end here */}
                    <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                        Wrong email?{" "}
                        <Link
                            to="/register"
                            className="cursor-pointer font-semibold text-teal-600 hover:text-teal-700 hover:underline dark:text-teal-400 dark:hover:text-teal-300"
                        >
                            Register again
                        </Link>
                    </p>
                </form>
            </section>
        </main>)
}
