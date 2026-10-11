import RegisterForm from "../components/RegisterForm.jsx"
import { Link } from "react-router-dom"
export default function Register() {
    return (
        <div className="signup-page">
            <h1>Sign-up</h1> 
            <RegisterForm/>
            <Link to='/login'>
                Have an account? Login
            </Link>
        </div>
    )
}
