import { useState } from "react";


export default function RegisterForm ()
{
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const [confirmpassword, setconfirmpassword] = useState("");
    const [error, setError] = useState("");
    const [success, setsuccess] =  useState(false);
    const [loading, setloading] = useState(false);


    const handleEmail = (e) => setemail(e.target.value);
    const handlePassword = (e) => 
    {
        if (e.target.value.length < 6)
            setError("Must conatain at least 6 chars")
        else setError("")
        setpassword(e.target.value);
    }
    const handleConfirmPassword = (e) =>
    {
        if (e.target.value.length < 6)
            setError("Must conatain at least 6 chars")
        else setError("");
        setconfirmpassword(e.target.value);
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setsuccess(false);
        if (!email.includes('@'))
        {
            setError("Invalid Email");
            return ;
        }
        
        if (confirmpassword !== password)
        {
            setError("Password do not match")
            return ;
        }
        else setError("");
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
                setError("email already registre")
            else setsuccess(true);
            console.log(result);
            
        } catch (error) {
            setError("Somthing happen wrong", error);
        }
        finally {setloading(false);}

    }
    return(
        <form onSubmit={handleSubmit}>
            {error && <p>{error}</p>}
            {success && "signup successfully"}
            <input type="email" 
                placeholder="Enter Your Email Address"
                value={email}
                onChange={handleEmail}
            />
            <input type="password" 
                placeholder="at least 6 characters"
                value={password}
                onChange={handlePassword}
            />
            <input type="password" 
                placeholder="Confirm Your Password"
                value={confirmpassword}
                onChange={handleConfirmPassword}
            />
            <button type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Sign-up"}</button>
        </form>
    )
}