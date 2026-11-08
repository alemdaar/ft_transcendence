import { Clock, MapPin, Monitor } from "lucide-react";

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
      <h4 className="break-words text-lg font-semibold">{request.topic}</h4>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted">
        {request.description}
      </p>
    </article>
  );
}
