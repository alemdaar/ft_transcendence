import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Hand,
  Home,
  LogIn,
  Menu,
  Trophy,
  Users,
  X,
} from "lucide-react";

const navigation = [
  { path: "/", label: "Home", icon: Home },
  { path: "/study-request", label: "Study Requests", icon: Hand },
  { label: "Friends", icon: Users },
  { path: "/groups", label: "Study Groups", icon: BookOpen },
  { label: "Leaderboard", icon: Trophy },
];

function SidebarLinks({ onNavigate }) {
  return navigation.map(({ path, label, icon: Icon }) =>
    path ? (
      <NavLink
        key={label}
        to={path}
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
        }
      >
        <Icon size={20} aria-hidden="true" />
        <span>{label}</span>
      </NavLink>
    ) : (
      <div key={label} className="sidebar-link opacity-50" aria-disabled="true">
        <Icon size={20} aria-hidden="true" />
        <span>{label}</span>
        <span className="ml-auto text-[10px]">Soon</span>
      </div>
    ),
  );
}

export default function Layout({ themeButton }) {
  const location = useLocation();
  const menu = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title =
    navigation.find((item) => item.path === location.pathname)?.label ||
    "StudyPeer";

  useEffect(() => {
    if (sidebarOpen) menu.current?.showModal();
    else menu.current?.close();
  }, [sidebarOpen]);

  const brand = (
    <Link
      to="/"
      onClick={() => setSidebarOpen(false)}
      className="flex items-center gap-3 text-lg font-bold text-fg"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
        <GraduationCap size={20} />
      </span>
      StudyPeer
    </Link>
  );

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-line px-6">
          {brand}
        </div>
        <nav
          aria-label="Main navigation"
          className="flex-1 space-y-1 px-3 py-4"
        >
          <SidebarLinks />
        </nav>
        <div className="border-t border-line p-3">
          <Link className="sidebar-link" to="/login">
            <LogIn size={18} />
            Sign in
          </Link>
        </div>
      </aside>
      <dialog
        ref={menu}
        onCancel={() => setSidebarOpen(false)}
        onClose={() => setSidebarOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSidebarOpen(false);
        }}
        className="mobile-sidebar"
        aria-label="Navigation menu"
      >
        <div className="flex min-h-dvh flex-col bg-surface">
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            {brand}
            <button
              type="button"
              className="theme-toggle"
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <nav
            aria-label="Mobile navigation"
            className="flex-1 space-y-1 px-3 py-4"
          >
            <SidebarLinks onNavigate={() => setSidebarOpen(false)} />
          </nav>
          <div className="border-t border-line p-3">
            <Link
              to="/login"
              className="sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <LogIn size={18} />
              Sign in
            </Link>
          </div>
        </div>
      </dialog>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
              className="theme-toggle lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {themeButton}
            <Link to="/login" className="btn-secondary">
              Sign in
            </Link>
          </div>
        </header>
        <main className="app-content mx-auto max-w-5xl p-4 pb-24 lg:p-8">
          <Outlet />
        </main>
      </div>
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-line bg-surface py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        {navigation
          .filter((item) => item.path)
          .map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs ${isActive ? "text-highlight" : "text-muted"}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
      </nav>
    </div>
  );
}
