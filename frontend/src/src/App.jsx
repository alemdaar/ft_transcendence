import Login from './pages/login.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './pages/Register.jsx'
import { Link } from 'react-router-dom';
import VerifyEmail from './pages/VerifyEmail.jsx';
import { useState } from 'react';
import sunIcon from './assets/dark.svg';
import moonIcon from './assets/moon.svg';

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
  const [darkmode, setdarkmode] = useState(false);


  return (
    <div className={darkmode ? "dark" : ""}>
      
      <div className='min-h-screen bg-green-50 text-gray-900 dark:bg-black dark:text-white'>
        <button
            onClick={() => setdarkmode(!darkmode)}
            aria-label={darkmode ? "Switch to light mode" : "Switch to dark mode"}
            className="fixed right-4 top-4 z-50 rounded-xl border border-white/70 p-2 transition-colors hover:bg-white/10 dark:border-white/40 dark:hover:bg-white/10 dark:bg-green-50"        >
            <img
                src={darkmode ? sunIcon : moonIcon}
                alt=""
                className="h-6 w-6"
            />
        </button>
        <BrowserRouter>
        
        <Routes>
          <Route  path='/' element={<Home/>} /> 

          <Route path='/login' element={<Login/>} />
          <Route path='/register' element={<Register/>} />
          <Route path='/verify-email' element={<VerifyEmail/>} />
        </Routes>
      </BrowserRouter>
      </div>
    </div>
    
  )
}



