import { useRef, useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { deleteGroup } from "../../services/groups";

export default function DeleteGroupModal({ group, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  async function handleDelete() {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError("");
    try {
      const result = await deleteGroup(group.id);
      onDeleted(result?.message || "Group deleted.");
    } catch (error) {
      setError(error.message || "Could not delete group.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} busy={loading} title="Delete group?">
      <p className="mb-5 text-sm leading-6 text-muted">
        Permanently delete <strong className="text-fg">{group.name}</strong>?
        This action cannot be undone.
      </p>
      {error && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" disabled={loading} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          disabled={loading}
          aria-busy={loading}
          onClick={handleDelete}
        >
          {loading ? "Deleting…" : "Delete group"}
        </Button>
      </div>
    </Modal>
  );
}
