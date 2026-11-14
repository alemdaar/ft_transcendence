import { Plus } from "lucide-react";
import Button from "../ui/Button";

export default function StudyRequestsHeader({ onPostRequest }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Study Requests</h2>
        <p className="mt-2 text-sm text-muted">
          Find a study partner or ask your peers for help.
        </p>
      </div>
      <Button onClick={onPostRequest}>
        <Plus size={18} />
        Post Request
      </Button>
    </div>
  );
}
