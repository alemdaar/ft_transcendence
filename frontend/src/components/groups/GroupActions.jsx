import { useRef, useState } from "react";
import Button from "../ui/Button";
import { joinGroup, requestGroupJoin } from "../../services/groups";

export default function GroupActions({ group, scope, onDetails, onChanged }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  async function handleJoin() {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError("");
    try {
      const result =
        group.type === "team"
          ? await requestGroupJoin(group.id)
          : await joinGroup(group.id);
      onChanged(
        result?.message ||
          (group.type === "team"
            ? "Join request sent."
            : "Successfully joined the group."),
      );
    } catch (error) {
      setError(error.message || "Could not join the group.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 space-y-3">
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {onDetails && (
          <Button
            variant="ghost"
            disabled={loading}
            onClick={() => onDetails(group, scope)}
          >
            Details
          </Button>
        )}
        {scope === "discover" && ["general", "team"].includes(group.type) && (
          <Button disabled={loading} aria-busy={loading} onClick={handleJoin}>
            {loading
              ? "Submitting…"
              : group.type === "team"
                ? "Request to Join"
                : "Join Now"}
          </Button>
        )}
        {scope === "pending" && (
          <span className="badge bg-selected text-highlight">
            Awaiting approval
          </span>
        )}
        {scope === "mine" && (
          <span className="badge bg-selected text-highlight">Member</span>
        )}
      </div>
    </div>
  );
}
