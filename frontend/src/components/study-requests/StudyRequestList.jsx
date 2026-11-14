import Button from "../ui/Button";
import StudyRequestCard from "./StudyRequestCard";

export default function StudyRequestList({
  loading,
  error,
  totalCount,
  requests,
  onRetry,
  onClearFilters,
}) {
  if (loading) {
    return (
      <p role="status" className="py-12 text-center text-sm text-muted">
        Loading study requests…
      </p>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-danger-line bg-danger-soft p-5 text-danger"
      >
        <p className="mb-4 text-sm">{error}</p>
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <p role="status" className="py-12 text-center text-sm text-muted">
        No posts created yet.
      </p>
    );
  }

  if (requests.length === 0) {
    return (
      <div role="status" className="py-12 text-center">
        <p className="mb-4 text-sm text-muted">
          No requests match your search or campus.
        </p>
        <Button variant="secondary" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {requests.map((request) => (
        <StudyRequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}
