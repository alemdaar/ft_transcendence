import { useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { claimRequest } from "../../services/studyRequests";

export default function ClaimMeetupModal({ request, onClose, onClaimed }) {
  const [specificSpot, setSpot] = useState("");
  const [meetTime, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await claimRequest(request.id, {
        specificSpot: specificSpot.trim(),
        meetTime,
      });
      onClaimed();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Modal
      open
      onClose={onClose}
      busy={loading}
      title="Propose a meetup"
      description="Choose a meeting spot and time for this on-site request."
    >
      <form onSubmit={submit} className="space-y-5">
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <fieldset disabled={loading} className="space-y-4">
          <Input
            label="Meeting spot"
            value={specificSpot}
            onChange={(event) => setSpot(event.target.value)}
            minLength={5}
            maxLength={100}
            placeholder="e.g. In the library"
            required
          />
          <Input
            label="Meeting time"
            type="time"
            value={meetTime}
            onChange={(event) => setTime(event.target.value)}
            required
          />
        </fieldset>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" disabled={loading} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Propose"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
