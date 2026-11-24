import StudyRequestCard from './StudyRequestCard';
import RequestActivityActions from './RequestActivityActions';
import Button from '../ui/Button';

export default function RequestActivityList({ requests, loading, error, scope, onRetry, onEdit, onDelete }) {
  if (loading) {
    return <p role="status" className="py-12 text-center text-muted">Loading activity…</p>;
  }
  if (error) {
    return (
      <div role="alert">
        <p className="mb-4 text-danger">{error}</p>
        <Button onClick={onRetry}>Try again</Button>
      </div>
    );
  }
  if (requests.length === 0) {
    return <p role="status" className="py-12 text-center text-muted">
      {scope === 'mine' ? 'You have not posted any requests yet.' : 'You have not claimed any requests yet.'}
    </p>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {requests.map(request => (
        <StudyRequestCard key={request.id} request={request}>
          <RequestActivityActions request={request} scope={scope} onEdit={onEdit} onDelete={onDelete} />
        </StudyRequestCard>
      ))}
    </div>
  );
}
