import { BookOpen, Plus, Users } from "lucide-react";
import Button from "../ui/Button";

export default function GroupsHeader({ onCreate, view, onChangeView }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Study Groups</h2>
        <p className="mt-2 text-sm text-muted">
          Join open study communities or request to join a project team
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Button variant="ghost" onClick={onChangeView}>
          {view === 'discover' ? <Users size={18} /> : <BookOpen size={18} />}
          {view === 'discover' ? 'My Groups' : 'Discover Groups'}
        </Button>
        <Button onClick={onCreate}>
          <Plus size={18} />
          Create
        </Button>
      </div>
    </div>
  );
}
