import { Clock, MapPin, Monitor } from "lucide-react";
import CardDescription from "../ui/CardDescription";

export default function StudyRequestCard({ request }) {
  return (
    <article className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <span
          className={`badge gap-1 ${request.status === "open" ? "bg-selected text-highlight" : "bg-soft text-muted"}`}
        >
          <Clock size={13} aria-hidden="true" />
          {request.status
            ? request.status.charAt(0).toUpperCase() + request.status.slice(1)
            : "Unknown status"}
        </span>
        <span className="badge gap-1 bg-soft text-fg">
          <Monitor size={13} aria-hidden="true" />
          {request.mode === "online"
            ? "Online"
            : request.mode === "insite"
              ? "On site"
              : request.mode}
        </span>
        {request.campus && (
          <span className="badge gap-1 bg-soft text-muted">
            <MapPin size={13} aria-hidden="true" />
            {request.campus}
          </span>
        )}
      </div>
      <h4 className="truncate h-7 break-words text-lg font-semibold leading-7">
        {request.topic}
      </h4>
      <CardDescription>{request.description}</CardDescription>
    </article>
  );
}
