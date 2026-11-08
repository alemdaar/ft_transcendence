import { useState } from 'react';
import GroupsHeader from '../components/groups/GroupsHeader';
import GroupBrowser from '../components/groups/GroupBrowser';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import MyGroupsSection from '../components/groups/MyGroupsSection';

export default function Groups() {
  const [showForm, setShowForm] = useState(false);
  const [revision, setRevision] = useState(0);
  const [view, setView] = useState('discover');

  return (
    <div className="space-y-8">
      <GroupsHeader onCreate={() => setShowForm(true)} view={view}
        onChangeView={() => setView(current => current === 'discover' ? 'mine' : 'discover')} />
      {view === 'mine' ? (
        <MyGroupsSection key={'mine-' + revision} onCreate={() => setShowForm(true)} />
      ) : (
        <GroupBrowser key={revision} />
      )}
      <CreateGroupModal open={showForm} onClose={() => setShowForm(false)} onCreated={() => setRevision(value => value + 1)} />
    </div>
  );
}
