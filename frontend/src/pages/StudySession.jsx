import StudyDemoControls from '../mocks/study-request/StudyDemoControls';
import StudyTestTokenControls from '../mocks/study-token/StudyTestTokenControls';
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useStudySession from "../hooks/useStudySession";
import SessionRequestInfo from "../components/sessions/SessionRequestInfo";
import SessionParticipants from "../components/sessions/SessionParticipants";
import SessionMeetup from "../components/sessions/SessionMeetup";
import Button from "../components/ui/Button";

export default function StudySession() {
  const { id } = useParams();
  const { data, loading, error, reload } = useStudySession(id);
  return (
    <div className="space-y-7">
      <StudyDemoControls />
      <StudyTestTokenControls />
      <Link
        to="/study-request?tab=activity"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft size={18} />
        Back to My Activity
      </Link>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Session Hub</h1>
        <Button variant="secondary" onClick={reload} disabled={loading}>
          Refresh session
        </Button>
      </div>
      {loading && (
        <p role="status" className="py-12 text-center text-muted">
          Loading session…
        </p>
      )}
      {error && (
        <div role="alert">
          <p className="mb-4 text-danger">{error}</p>
          <Button onClick={reload}>Try again</Button>
        </div>
      )}
      {data && (
        <>
          <SessionRequestInfo request={data.succes} />
          <SessionParticipants profiles={data.profiles} />
          {data.succes.mode === "insite" && data.succes.meetup && (
            <SessionMeetup meetup={data.succes.meetup} />
          )}
        </>
      )}
    </div>
  );
}
