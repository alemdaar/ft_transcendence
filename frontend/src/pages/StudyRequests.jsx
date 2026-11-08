import { useState } from "react";
import useStudyRequests from "../hooks/useStudyRequests";
import StudyRequestsHeader from "../components/study-requests/StudyRequestsHeader";
import StudyRequestFeed from "../components/study-requests/StudyRequestFeed";
import CreateStudyRequestModal from "../components/study-requests/CreateStudyRequestModal";

export default function StudyRequests() {
  const [showForm, setShowForm] = useState(false);
  const { requests, loading, error, reload } = useStudyRequests();

  return (
    <div className="space-y-6">
      <StudyRequestsHeader onPostRequest={() => setShowForm(true)} />
      <StudyRequestFeed
        requests={requests}
        loading={loading}
        error={error}
        onRefresh={reload}
      />
      <CreateStudyRequestModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={reload}
      />
    </div>
  );
}
