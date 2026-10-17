import { useState } from "react"
import hideIcon from '../assets/hide.svg'
import showIcon from '../assets/show.svg'

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading]  = useState(false);
    const [sucess, setSucess] = useState(false);
    const [showPassword, setshowPassword] = useState(false);


    const handleChange = (e) => setEmail(e.target.value);
    const handlePass = (e) => setPassword(e.target.value);
    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        setSucess(false);
        setError("");
        if (password.length < 8)
        {
            setError("Password should contain at least 8 characters");
            return ;
        }
        if (!email.includes('@'))
        {
            setError("Please include '@' in email Address");
                return;
        }
        let data = {
            email, 
            password
        }

        setLoading(true);

        try {
            
            const response =  await fetch('/auth/login', {
                method: "POST",
                headers: {
                    "content-type" : "application/json"
                },
                body: JSON.stringify(data),
    
            });
            const result = await response.json();
            
        
    
            if (!response.ok)
                    setError(result.message ||
                            result.error || "Login failed. Please try again");
            else setSucess(true)
        } catch (error) {
                console.error(error);
                setError("Cannot connect to the server.");
        }
        finally {setLoading(false);}
            
    }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                {error}
            </p>
        )}

        {sucess && (
            <p className="mb-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/50 dark:text-teal-300">
                Login successful!
            </p>
        )}
       
        <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-teal-500 dark:focus:bg-zinc-800 dark:focus:ring-teal-500/20"
        />
        <div className="relative">
            <input type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={handlePass}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 py-3 pl-4 pr-11 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-teal-500 dark:focus:bg-zinc-800 dark:focus:ring-teal-500/20"
            />
            <button type="button"
                onClick={() => setshowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-200/70 dark:hover:bg-zinc-700"
            >
                <img src={showPassword ? hideIcon : showIcon} alt="" className="h-5 w-5 opacity-70 hover:opacity-100 dark:brightness-0 dark:invert dark:opacity-90"/>
            </button>
        </div>
        <button type="submit" disabled={loading}
            className="mt-5 w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus:ring-offset-zinc-900"

        >
            {loading ? "login in.." : "Login"}</button>
    </form>
  )
}