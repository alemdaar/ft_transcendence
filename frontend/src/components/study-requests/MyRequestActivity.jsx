import { useState } from 'react';
import useRequestActivity from '../../hooks/useRequestActivity';
import RequestActivityList from './RequestActivityList';
import EditRequestModal from './EditRequestModal';
import DeleteRequestModal from './DeleteRequestModal';
import Button from '../ui/Button';

export default function MyRequestActivity({ onChanged }) {
  const [scope, setScope] = useState('mine');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { requests, loading, error, reload } = useRequestActivity(scope);
  function changed() { setEditing(null); setDeleting(null); reload(); onChanged(); }
  return <section className="space-y-5" aria-label="My request activity">
    <div role="group" aria-label="Activity type" className="flex gap-2">
      <Button variant={scope === 'mine' ? 'primary' : 'secondary'} onClick={() => setScope('mine')}>My Requests</Button>
      <Button variant={scope === 'iclaimed' ? 'primary' : 'secondary'} onClick={() => setScope('iclaimed')}>Requests I Claimed</Button>
    </div>
    <RequestActivityList requests={requests} loading={loading} error={error} scope={scope}
      onRetry={reload} onEdit={setEditing} onDelete={setDeleting} />
    {editing && <EditRequestModal key={editing.id} request={editing} onClose={() => setEditing(null)} onSaved={changed} />}
    {deleting && <DeleteRequestModal request={deleting} onClose={() => setDeleting(null)} onDeleted={changed} />}
  </section>;
}
