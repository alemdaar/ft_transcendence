import { useState } from 'react';
import useGroups from '../../hooks/useGroups';
import GroupList from './GroupList';
import GroupPagination from './GroupPagination';
import { Clock, Users } from 'lucide-react';

export default function MyGroupsSection({ onCreate }) {
  const [scope, setScope] = useState('mine');
  const [page, setPage] = useState(1);
  const { groups, pagination, loading, error, reload } = useGroups({ scope, page });

  function changeScope(value) {
    setScope(value);
    setPage(1);
  }

  return (
    <section aria-labelledby="my-groups-title" className="space-y-4">
      <div role="group" aria-label="Your groups and join requests" className="grid grid-cols-2 gap-1 rounded-xl bg-soft p-1 sm:max-w-md">
        {[{ value: 'mine', label: 'My Groups', icon: Users }, { value: 'pending', label: 'Pending Requests', icon: Clock }].map(({ value, label, icon: Icon }) => (
          <button key={value} type="button" aria-pressed={scope === value} onClick={() => changeScope(value)}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight ${scope === value ? 'bg-surface text-highlight shadow-sm' : 'text-muted hover:text-fg'}`}>
            <Icon size={17} aria-hidden="true" />{label}
          </button>
        ))}
      </div>
      <div>
        <h3 id="my-groups-title" className="text-xl font-semibold">{scope === 'mine' ? 'My Groups' : 'Pending Requests'}</h3>
        <p className="mt-2 text-sm text-muted">{scope === 'mine' ? 'Groups you are a member of.' : 'Your requests waiting for approval to join a group.'}</p>
      </div>
      <GroupList groups={groups} loading={loading} error={error} scope={scope} onRetry={reload} onCreate={onCreate} />
      <GroupPagination pagination={pagination} loading={loading} onChange={setPage} />
    </section>
  );
}
