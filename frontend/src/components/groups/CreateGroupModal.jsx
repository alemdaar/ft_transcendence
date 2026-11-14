import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import GroupTypeSelector from "./GroupTypeSelector";
import { createGroup } from "../../services/groups";

export default function CreateGroupModal({ open, onClose, onCreated }) {
  const [type, setType] = useState("general");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberLimit, setMemberLimit] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (
      type === "team" &&
      (!Number.isInteger(memberLimit) || memberLimit < 2 || memberLimit > 6)
    ) {
      setError("A team must have between 2 and 6 members.");
      return;
    }
    setLoading(true);
    try {
      const group = { name, type, description };
      if (type === "team") group.memberLimit = memberLimit;
      await createGroup(group);
      setName("");
      setDescription("");
      setMemberLimit(2);
      onClose();
      onCreated();
    } catch (error) {
      setError(error.message || "Could not create group.");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setError("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      busy={loading}
      title="Create a group"
      description="Start a community or build your project team."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-danger-line bg-danger-soft p-3 text-sm text-danger"
          >
            {error}
          </p>
        )}
        <fieldset disabled={loading} className="space-y-4">
          <GroupTypeSelector type={type} onChange={setType} />
          <Input
            label="Group name"
            id="group-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={3}
            maxLength={30}
            placeholder="e.g. Minishell team"
            required
          />
          <Input
            label="Description"
            id="group-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What is this group about?"
            required
          />
          {type === "team" && (
            <Input
              label="Member limit"
              id="group-limit"
              type="number"
              min={2}
              max={6}
              step={1}
              value={memberLimit}
              onChange={(event) => setMemberLimit(Number(event.target.value))}
              required
            />
          )}
        </fieldset>
        <div className="flex justify-end gap-3 border-t border-line pt-5">
          <Button variant="secondary" disabled={loading} onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} aria-busy={loading}>
            {loading ? "Creating…" : "Create group"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
