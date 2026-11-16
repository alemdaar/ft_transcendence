import { useSearchParams } from 'react-router-dom';
import MyRequestActivity from '../components/study-requests/MyRequestActivity';
import Button from '../components/ui/Button';
import { useState } from "react";
import useStudyRequests from "../hooks/useStudyRequests";
import StudyRequestsHeader from "../components/study-requests/StudyRequestsHeader";
import StudyRequestFeed from "../components/study-requests/StudyRequestFeed";
import CreateStudyRequestModal from "../components/study-requests/CreateStudyRequestModal";

export default function StudyRequests() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'activity' ? 'activity' : 'feed';
  function setTab(value) { setParams(value === 'activity' ? { tab: 'activity' } : {}, { replace: true }); }
  const [activityRevision, setActivityRevision] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const { requests, loading, error, reload } = useStudyRequests();

  return (
    <div className="space-y-6">
      <StudyRequestsHeader onPostRequest={() => setShowForm(true)} />
      <div role="group" aria-label="Study request views" className="flex gap-1 rounded-xl bg-soft p-1">
        <Button className="flex-1" variant={tab === 'feed' ? 'secondary' : 'ghost'} onClick={() => setTab('feed')}>Live Feed</Button>
        <Button className="flex-1" variant={tab === 'activity' ? 'secondary' : 'ghost'} onClick={() => setTab('activity')}>My Activity</Button>
      </div>
      {tab === 'activity' ? <MyRequestActivity key={activityRevision} onChanged={reload} /> : <StudyRequestFeed
        requests={requests}
        loading={loading}
        error={error}
        onRefresh={reload}
      />}
      <CreateStudyRequestModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => { reload(); setActivityRevision(value => value + 1); setTab('activity'); }}
      />
    </div>
  );
}
