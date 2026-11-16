import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Hand } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome to StudyPeer
        </h2>
        <p className="mt-2 text-sm text-muted">
          Learn together, share knowledge, and grow with your peers.
        </p>
      </div>
      <section
        className="grid gap-4 sm:grid-cols-2"
        aria-label="Explore StudyPeer"
      >
        {[
          {
            to: "/study-request",
            title: "Study Requests",
            description: "Ask for help or share what you know.",
            icon: Hand,
          },
          {
            to: "/groups",
            title: "Study Groups",
            description: "Find your community and learn together.",
            icon: BookOpen,
          },
        ].map(({ to, title, description, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="card block transition hover:ring-brand-200"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-selected text-highlight">
              <Icon size={22} />
            </span>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-2 text-sm text-muted">{description}</p>
            <span className="mt-5 flex items-center gap-2 text-sm font-semibold text-highlight">
              Explore <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
