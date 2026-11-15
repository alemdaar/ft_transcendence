import SuccessNotice from "../components/ui/SuccessNotice";
import { useLocation } from "react-router-dom";

import { useCallback, useState } from "react";
import GroupsHeader from "../components/groups/GroupsHeader";
import GroupBrowser from "../components/groups/GroupBrowser";
import CreateGroupModal from "../components/groups/CreateGroupModal";
import MyGroupsSection from "../components/groups/MyGroupsSection";

export default function Groups() {
  const [showForm, setShowForm] = useState(false);
  const [revision, setRevision] = useState(0);

  const location = useLocation();
  const [notice, setNotice] = useState(location.state?.notice || "");
  const dismissNotice = useCallback(() => setNotice(""), []);
  const [view, setView] = useState(location.state?.view || "discover");

  function handleChanged(message) {
    setNotice(message);
    setRevision((value) => value + 1);
  }

  return (
    <div className="space-y-8">
      <GroupsHeader
        onCreate={() => setShowForm(true)}
        view={view}
        onChangeView={() =>
          setView((current) => (current === "discover" ? "mine" : "discover"))
        }
      />
      {notice && (
        <SuccessNotice
          key={revision}
          message={notice}
          onDismiss={dismissNotice}
        />
      )}
      {view === "mine" ? (
        <MyGroupsSection
          key={"mine-" + revision}
          onCreate={() => setShowForm(true)}
          onChanged={handleChanged}
        />
      ) : (
        <GroupBrowser key={revision} onChanged={handleChanged} />
      )}
      <CreateGroupModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => setRevision((value) => value + 1)}
      />
    </div>
  );
}
