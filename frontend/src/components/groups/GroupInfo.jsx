import { MapPin, Users } from 'lucide-react';

export default function GroupInfo({ group }) {
  const date = new Date(group.createdAt);
  return <section className="space-y-6" aria-labelledby="group-name">
    <div className="flex flex-wrap items-center gap-2">
      <span className="badge bg-selected text-highlight">{group.type === 'team' ? 'Team' : 'General'}</span>
      <span className="badge gap-1 bg-soft text-muted"><MapPin size={14} />{group.campus}</span>
      <span className="badge gap-1 bg-soft text-muted"><Users size={14} />{group._count?.members ?? 0}{group.memberLimit ? ' / ' + group.memberLimit : ''} members</span>
    </div>
    <h2 id="group-name" className="break-words text-3xl font-bold tracking-tight">{group.name}</h2>
    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted">{group.description}</p>
    {!Number.isNaN(date.getTime()) && <p className="text-xs text-muted">Created <time dateTime={group.createdAt}>{date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</time></p>}
  </section>;
}
