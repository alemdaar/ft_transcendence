import { useState } from "react"

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading]  = useState(false);
    const [sucess, setSucess] = useState(false);



    const handleChange = (e) => setEmail(e.target.value);
    const handlePass = (e) => setPassword(e.target.value);
    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        setSucess(false);
        setError("");
        if (password.length < 6)
        {
            setError("Password should contain at least 6 characters");
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
        const fakeData = {
            email: "a@b.c",
            password: "123456"
        }
        setLoading(true);
        // setTimeout(() => {
        //     console.log('waiting api...') 
        //     if (data.email === fakeData.email && data.password === fakeData.password)
        //             setSucess(true);
        //     else
        //         setError("Email or password not valid")
        //     setLoading(false);
        // }, 2000);
        try {
            
            const response =  await fetch('/auth/login', {
                method: "POST",
                headers: {
                    "content-type" : "application/json"
                },
                body: JSON.stringify(data),
    
            });
            const result = await response.json();
            console.log(result);
        
    
            if (!response.ok)
                    setError("Email or password not valid");
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
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
            </p>
        )}

        {sucess && (
            <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
                Login successful!
            </p>
        )}
       
        <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-green-700 dark:bg-green-950 dark:text-white dark:focus:ring-green-800"
        />
       
        <input type="password" 
            placeholder="Password"
            value={password}
            onChange={handlePass}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-green-700 dark:bg-green-950 dark:text-white dark:focus:ring-green-800"
        />
       
        <button type="submit" disabled={loading}
            className="mt-5 w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-green-600 dark:hover:bg-green-500"

        >
            {loading ? "login in.." : "Login"}</button>
    </form>
  )
}