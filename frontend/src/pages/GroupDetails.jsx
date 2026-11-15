import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useGroupDetails from "../hooks/useGroupDetails";
import useAuth from "../hooks/useAuth";
import GroupInfo from "../components/groups/GroupInfo";
import DeleteGroupModal from "../components/groups/DeleteGroupModal";
import Button from "../components/ui/Button";

export default function GroupDetails() {
  const { id } = useParams();
  const { group, loading, error, retry } = useGroupDetails(id);
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const isOwner =
    group?.isOwner === true ||
    (group?.ownerId != null &&
      user?.id != null &&
      String(group.ownerId) === String(user.id));

  return (
    <div className="space-y-8">
      <Link
        to="/groups"
        state={{ view: "mine" }}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-fg"
      >
        <ArrowLeft size={18} />
        Back to My Groups
      </Link>
      {loading && (
        <p role="status" className="py-12 text-center text-muted">
          Loading group…
        </p>
      )}
      {error && (
        <div role="alert">
          <p className="mb-4 text-sm text-danger">{error}</p>
          <Button variant="secondary" onClick={retry}>
            Try again
          </Button>
        </div>
      )}
      {group && (
        <>
          <GroupInfo group={group} />
          {isOwner && (
            <div className="border-t border-line pt-6">
              <Button variant="danger" onClick={() => setDeleting(true)}>
                Delete group
              </Button>
            </div>
          )}
          {deleting && (
            <DeleteGroupModal
              group={group}
              onClose={() => setDeleting(false)}
              onDeleted={(message) =>
                navigate("/groups", {
                  replace: true,
                  state: { view: "mine", notice: message },
                })
              }
            />
          )}
        </>
      )}
    </div>
  );
}
