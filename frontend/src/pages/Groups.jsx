import GroupDetailsModal from "../components/groups/GroupDetailsModal";
import DeleteGroupModal from "../components/groups/DeleteGroupModal";
import { useState } from "react";
import GroupsHeader from "../components/groups/GroupsHeader";
import GroupBrowser from "../components/groups/GroupBrowser";
import CreateGroupModal from "../components/groups/CreateGroupModal";
import MyGroupsSection from "../components/groups/MyGroupsSection";

export default function Groups() {
  const [showForm, setShowForm] = useState(false);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");
  const [view, setView] = useState("discover");

  function handleChanged(message) {
    setSelected(null);
    setDeleting(null);
    setNotice(message);
    setRevision((value) => value + 1);
  }
  function showDetails(group, scope) {
    setSelected({ group, scope });
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
        <p
          role="status"
          className="rounded-xl border border-success-line bg-selected p-3 text-sm text-success"
        >
          {notice}
        </p>
      )}
      {view === "mine" ? (
        <MyGroupsSection
          key={"mine-" + revision}
          onCreate={() => setShowForm(true)}
          onDetails={showDetails}
          onChanged={handleChanged}
        />
      ) : (
        <GroupBrowser
          key={revision}
          onDetails={showDetails}
          onChanged={handleChanged}
        />
      )}
      {selected && !deleting && (
        <GroupDetailsModal
          key={selected.group.id}
          selected={selected}
          onClose={() => setSelected(null)}
          onChanged={handleChanged}
          onDelete={setDeleting}
        />
      )}
      {deleting && (
        <DeleteGroupModal
          group={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={handleChanged}
        />
      )}
      <CreateGroupModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => setRevision((value) => value + 1)}
      />
    </div>
  );
}
