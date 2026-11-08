import { MapPin, Users } from "lucide-react";

export default function GroupCard({ group }) {
  const created = group.createdAt ? new Date(group.createdAt) : null;
  return (
    <article className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="badge bg-selected text-highlight">
          {group.type === "team" ? "Team" : "General"}
        </span>
        {group.campus && (
          <span className="badge gap-1 bg-soft text-muted">
            <MapPin size={13} />
            {group.campus}
          </span>
        )}
      </div>
      <h3 className="break-words text-lg font-semibold">{group.name}</h3>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted">
        {group.description}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Users size={15} />
          {group._count?.members ?? 0}
          {group.memberLimit != null ? " / " + group.memberLimit : ""} members
        </span>
        {created && !Number.isNaN(created.getTime()) && (
          <time dateTime={group.createdAt}>
            {created.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        )}
      </div>
    </article>
  );
}
