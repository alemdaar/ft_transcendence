import { Link } from 'react-router-dom';
import GroupActions from "./GroupActions";
import CardDescription from "../ui/CardDescription";
import { MapPin, Users } from "lucide-react";

export default function GroupCard({
  group,
  scope,

  onChanged,
  expanded = false,
}) {
  const created = group.createdAt ? new Date(group.createdAt) : null;
  return (
    <article className={`relative min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6 ${scope === "mine" ? "transition hover:border-highlight focus-within:ring-2 focus-within:ring-highlight" : ""}`}>
      {scope === 'mine' && <Link to={'/groups/' + group.id} aria-label={'Open ' + group.name} className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-highlight" />}
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
      <h3
        className={`break-words text-lg font-semibold leading-7 ${expanded ? "" : "truncate h-7"}`}
      >
        {group.name}
      </h3>
      <CardDescription expanded={expanded}>{group.description}</CardDescription>
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
      <GroupActions
        group={group}
        scope={scope}
        onChanged={onChanged}
      />
    </article>
  );
}
