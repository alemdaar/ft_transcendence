import Login from './pages/login.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './pages/Register.jsx'
import { Link } from 'react-router-dom';
import VerifyEmail from './pages/VerifyEmail.jsx';


function Home()
{
  return (
    <div>
      <Link to='/login'>
      Login
      </Link>
      <br />
      <Link to='/register'>
      Sign-up
      </Link>
    </div>
  )
}
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route  path='/' element={<Home/>} /> 

        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/verify-email' element={<VerifyEmail/>} />
      </Routes>
    </BrowserRouter>
  )
}