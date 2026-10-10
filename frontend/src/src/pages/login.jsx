import LoginForm from "../components/LoginForm.jsx"
import { Link } from "react-router-dom";

export default function Login() {
    return (
        <div className="login-page">
            <h1>Login</h1> 
            <LoginForm/>
            <Link to='/register'>
                Don't have acount? Sign-up
            </Link>
        </div>
    )
}

