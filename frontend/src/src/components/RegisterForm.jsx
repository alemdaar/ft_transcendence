import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterForm ()
{
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const [confirmpassword, setconfirmpassword] = useState("");
    const [error, setError] = useState("");
    const [success, setsuccess] =  useState(false);
    const [loading, setloading] = useState(false);
    const navigate = useNavigate();


    const handleEmail = (e) => setemail(e.target.value);
    const handlePassword = (e) => setpassword(e.target.value);

    const handleConfirmPassword = (e) => setconfirmpassword(e.target.value);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setsuccess(false);
        if (!email.includes('@')) {
            setError("Please enter a valid email address.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (confirmpassword !== password) {
            setError("Passwords do not match.");
            return;
        }
        const data = {
            email, 
            password
        }
        setloading(true);
        try {
            const response = await fetch('/auth/register', {
                method: "POST", 
                headers: {
                    "content-type" : "application/json"
                },
                body: JSON.stringify(data)
            })
            const result = await response.json();
            if (!response.ok)
                setError(result.message ||
                            result.error || "Registeration failed. Please try again")
            else {
                setsuccess(true);
                navigate("/verify-email", 
                    { state: {email} }
                );
            }
            
            
        } catch (error) {
            setError("Cannot connect to the server.");
        }
        finally {setloading(false);}
    }
    return (
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
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
                Account created successfully!
            </p>
        )}

        <div className="space-y-1.5">
            <label
                htmlFor="register-email"
                className="block text-sm font-medium text-gray-700 dark:text-green-100"
            >
                Email address
            </label>

            <input
                id="register-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmail}
                autoComplete="email"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-green-700 dark:bg-green-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-green-800"
            />
        </div>

        <div className="space-y-1.5">
            <label
                htmlFor="register-password"
                className="block text-sm font-medium text-gray-700 dark:text-green-100"
            >
                Password
            </label>

            <input
                id="register-password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={handlePassword}
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-green-700 dark:bg-green-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-green-800"
            />
        </div>

        <div className="space-y-1.5">
            <label
                htmlFor="register-confirm-password"
                className="block text-sm font-medium text-gray-700 dark:text-green-100"
            >
                Confirm password
            </label>

            <input
                id="register-confirm-password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmpassword}
                onChange={handleConfirmPassword}
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-green-700 dark:bg-green-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-green-800"
            />
        </div>

        <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-green-600 dark:hover:bg-green-500"
        >
            {loading ? "Creating account..." : "Create account"}
        </button>

    </form>
    );
}
// return(
//     <form onSubmit={handleSubmit}>
//         {error && <p>{error}</p>}
//         {success && "signup successfully"}
//         <input type="email" 
//             placeholder="Enter Your Email Address"
//             value={email}
//             onChange={handleEmail}
//         />
//         <br />
//         <input type="password" 
//             placeholder="at least 6 characters"
//             value={password}
//             onChange={handlePassword}
//         />
//         <br />
//         <input type="password" 
//             placeholder="Confirm Your Password"
//             value={confirmpassword}
//             onChange={handleConfirmPassword}
//         />
//         <br />
//         <button type="submit" disabled={loading}>
//             {loading ? "Creating account..." : "Sign-up"}</button>
//     </form>
// )