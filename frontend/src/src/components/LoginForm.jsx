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
            console.log(error)
        }
        finally {setLoading(false);}
            
    }

  return (
    <form onSubmit={handleSubmit}>
        {error && <p>{error}</p>}
        {sucess && <p>"Login sucessfully !"</p> }
        <input type="email" 
            placeholder="Enter your email"
            value={email}
            onChange={handleChange}
            />
        <input type="password" 
            placeholder="Password"
            value={password}
            onChange={handlePass}
        />
        <button type="submit" disabled={loading}>
            {loading ? "login in.." : "Login"}</button>
    </form>
  )
}