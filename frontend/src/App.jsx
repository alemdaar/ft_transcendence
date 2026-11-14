import DemoBanner from './components/ui/DemoBanner';
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Groups from './pages/Groups.jsx';
import StudyRequests from './pages/StudyRequests.jsx';

export default function App() {
 const [darkMode, setDarkMode] = useState(false);
 const themeButton = <button type="button" className="theme-toggle" onClick={() => setDarkMode(value => !value)} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>;
 const authPage = page => <><div className="fixed right-4 top-4 z-50">{themeButton}</div>{page}</>;
 return <div className={darkMode ? 'dark' : ''}><div className="min-h-screen bg-bg text-fg"><DemoBanner /><BrowserRouter><Routes>
  <Route element={<Layout themeButton={themeButton} />}>
   <Route index element={<Home />} />
   <Route path="groups" element={<Groups />} />
   <Route path="study-request" element={<StudyRequests />} />
  </Route>
  <Route path="login" element={authPage(<Login />)} />
  <Route path="register" element={authPage(<Register />)} />
  <Route path="verify-email" element={authPage(<VerifyEmail />)} />
 </Routes></BrowserRouter></div></div>;
}
