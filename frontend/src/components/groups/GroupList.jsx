import Button from "../ui/Button";
import GroupCard from "./GroupCard";
import GroupEmptyState from "./GroupEmptyState";

export default function GroupList({
  groups,
  loading,
  error,
  scope,
  onRetry,
  onCreate,
  onDetails,
  onChanged,
}) {
  if (loading)
    return (
      <p role="status" className="py-12 text-center text-sm text-muted">
        Loading groups…
      </p>
    );
  if (error)
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
  if (groups.length === 0)
    return <GroupEmptyState scope={scope} onCreate={onCreate} />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          scope={scope}
          onDetails={onDetails}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}
