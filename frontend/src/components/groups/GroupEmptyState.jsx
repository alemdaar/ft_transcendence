import { Users } from 'lucide-react';
import Button from '../ui/Button';

export default function GroupEmptyState({ scope, onCreate }) {
  if (scope !== 'mine') {
    return <p role="status" className="py-12 text-center text-sm text-muted">
      {scope === 'pending' ? 'You have no pending join requests.' : 'No groups match your search and filters.'}
    </p>;
  }

  return (
    <div role="status" className="flex min-h-[340px] flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[390px]">
      <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-soft text-muted">
        <Users size={36} strokeWidth={1.7} aria-hidden="true" />
      </span>
      <h4 className="text-xl font-semibold">No groups yet</h4>
      <p className="mb-5 mt-2 text-sm leading-6 text-muted sm:text-base">Create a study group or join one from the directory below</p>
      <Button onClick={onCreate}>Create a group</Button>
    </div>
  );
}
