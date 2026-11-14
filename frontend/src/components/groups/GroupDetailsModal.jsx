import Modal from "../ui/Modal";
import Button from "../ui/Button";
import GroupCard from "./GroupCard";
import useGroupDetails from "../../hooks/useGroupDetails";
import useAuth from "../../hooks/useAuth";

export default function GroupDetailsModal({
  selected,
  onClose,
  onChanged,
  onDelete,
}) {
  const { group, loading, error, retry } = useGroupDetails(selected.group.id);
  const { user } = useAuth();
  const ownerId = group?.ownerId ?? selected.group.ownerId;
  const isOwner =
    group?.isOwner === true ||
    selected.group.isOwner === true ||
    (ownerId != null &&
      user?.id != null &&
      String(ownerId) === String(user.id));

  return (
    <Modal open onClose={onClose} title="Group details">
      {loading && (
        <p role="status" className="py-8 text-center text-muted">
          Loading group…
        </p>
      )}
      {error && (
        <div role="alert">
          <p className="mb-4 text-sm text-danger">{error}</p>
          <Button variant="secondary" onClick={retry}>
            Try again
          </Button>
        </div>
      )}
      {group && (
        <>
          <GroupCard
            group={group}
            scope={selected.scope}
            onChanged={onChanged}
            expanded
          />
          {isOwner && (
            <div className="mt-5 border-t border-line pt-5">
              <Button variant="danger" onClick={() => onDelete(group)}>
                Delete group
              </Button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
