import { useState } from "react"
import { useLocation } from "react-router-dom";

export default function VerifyEmail()
{
    const [code, setcode] = useState("");
    const location = useLocation();
    const email = location.state?.email;
    const [error, seterror] = useState("");
    const [success, setsuccess] = useState("");
    const [loading, setloading] = useState(false);
    

    const handleSubmit =  async (e) => {
        e.preventDefault();
        seterror("");
        setsuccess("");
        if (!email || !code)
        {
            seterror("Email and Verification code are required.");
            return;
        }
        setloading(true);

        try {
            const response = await fetch("http://localhost:3001/auth/verify-email",
                {
                    method: "POST", 
                    headers:{ "content-type" : "application/json"}, 
                    body: JSON.stringify({
                        email,
                        code
                    })
                })
            const resulte = await response.json();
            if (!response.ok)
                seterror(resulte.message || "Verification failed. ")
            else setsuccess("Verification successfully.")
                

        } catch (error) {
            seterror("Cannot connect to the server.")
        }
        finally { setloading(false) }

    }

    return (
        <div>
            <h1>Verify Your Email</h1>
            <p>Enter The Verification code sent to your Email.</p>
            <form onSubmit={handleSubmit}>
                {error && <p>{error}</p>}
                {success && <p>{success}</p>}

                <input type="text" 
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => setcode(e.target.value)}
                />
                <button type="submit" disabled={loading}> {loading ? "Verifying..." : "Verify"}</button>
            </form>
            
        </div>
    )
}