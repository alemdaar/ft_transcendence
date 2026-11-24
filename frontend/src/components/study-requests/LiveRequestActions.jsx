import { useState } from "react";
import { Eye, Hand } from "lucide-react";
import Button from "../ui/Button";
import ClaimMeetupModal from "./ClaimMeetupModal";
import { claimRequest } from "../../services/studyRequests";

export default function LiveRequestActions({ request, onDetails, onClaimed }) {
  const [showMeetup, setShowMeetup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function claim() {
    if (loading) return;
    if (request.mode === "insite") {
      setShowMeetup(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await claimRequest(request.id);
      onClaimed();
    } catch (error) {
      setError(error.message);
    } finally {
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
      <div className="grid grid-cols-2 gap-3">
        <Button variant="ghost" onClick={() => onDetails(request)}>
          <Eye size={16} />
          Details
        </Button>
        <Button disabled={loading || request.status !== "open"} onClick={claim}>
          <Hand size={16} />
          {loading
            ? "Claiming…"
            : request.mode === "insite"
              ? "Propose"
              : "Claim"}
        </Button>
      </div>
      {showMeetup && (
        <ClaimMeetupModal
          request={request}
          onClose={() => setShowMeetup(false)}
          onClaimed={() => {
            setShowMeetup(false);
            onClaimed();
          }}
        />
      )}
    </div>
  );
}
