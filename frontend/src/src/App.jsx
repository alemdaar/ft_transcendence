import Login from './pages/login.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './pages/Register.jsx'
import { Link } from 'react-router-dom';
import VerifyEmail from './pages/VerifyEmail.jsx';
import { useState } from 'react';
import sunIcon from './assets/dark.svg';
import moonIcon from './assets/moon.svg';
import Groups from './pages/groups.jsx'


function Home()
{
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 transition-colors duration-300 dark:bg-zinc-950">
      <div className="flex w-full max-w-xs flex-col gap-3.5 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-lg shadow-zinc-900/5 transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40">
        <Link
          to='/login'
          className="rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500"
        >
          Login
        </Link>
        <Link
          to='/register'
          className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-teal-600 hover:bg-white hover:text-teal-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-teal-500 dark:hover:bg-zinc-800/80 dark:hover:text-teal-400"
        >
          Sign-up
        </Link>
        <Link
          to='/groups'
          className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-teal-600 hover:bg-white hover:text-teal-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-teal-500 dark:hover:bg-zinc-800/80 dark:hover:text-teal-400"
        >
          Groups
        </Link>
      </div>
    </div>
  )
}

export default function App() { 
  const [darkmode, setdarkmode] = useState(false);


  return (
    <div className={darkmode ? "dark" : ""}>
      
      <div className='min-h-screen bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100'>
        <button
            onClick={() => setdarkmode(!darkmode)}
            aria-label={darkmode ? "Switch to light mode" : "Switch to dark mode"}
            className="fixed right-4 top-4 z-50 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm transition-all hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
            <img
                src={darkmode ? sunIcon : moonIcon}
                alt=""
                className="h-5 w-5 object-contain opacity-80 transition-opacity hover:opacity-100 dark:brightness-0 dark:invert"
            />
        </button>
        <BrowserRouter>
        
        <Routes>
          <Route path='/' element={<Home/>} /> 

          <Route path='/login' element={<Login/>} />
          <Route path='/register' element={<Register/>} />
          <Route path='/verify-email' element={<VerifyEmail/>} />
          <Route path='/groups' element={<Groups/>}/>
        </Routes>
      </BrowserRouter>
      </div>
    </div>
    
  )
}