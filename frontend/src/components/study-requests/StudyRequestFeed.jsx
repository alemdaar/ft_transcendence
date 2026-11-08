import { useState } from "react";
import { RefreshCw } from "lucide-react";
import Button from "../ui/Button";
import StudyRequestFilters from "./StudyRequestFilters";
import StudyRequestList from "./StudyRequestList";

export default function StudyRequestFeed({
  requests,
  loading,
  error,
  onRefresh,
}) {
  const [search, setSearch] = useState("");
  const [campus, setCampus] = useState("");
  const normalizedCampus = campus.trim().replace(/\s+/g, ' ').toLowerCase();
  const query = search.trim().toLowerCase();
  const visibleRequests = requests.filter(
    (request) =>
      (!campus || (request.campus || '').trim().replace(/\s+/g, ' ').toLowerCase() === normalizedCampus) &&
      `${request.topic || ""} ${request.description || ""}`
        .toLowerCase()
        .includes(query),
  );

  function clearFilters() {
    setSearch("");
    setCampus("");
  }

  return (
    <section aria-labelledby="feed-title" className="space-y-5">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h3 id="feed-title" className="font-semibold">
          Live Feed{!loading && !error ? " (" + requests.length + ")" : ""}
        </h3>
        <Button variant="ghost" disabled={loading} onClick={onRefresh}>
          <RefreshCw size={15} aria-hidden="true" />
          Refresh
        </Button>
      </div>
      <StudyRequestFilters
        search={search}
        campus={campus}
        onSearchChange={setSearch}
        onCampusChange={setCampus}
      />
      <StudyRequestList
        loading={loading}
        error={error}
        totalCount={requests.length}
        requests={visibleRequests}
        onRetry={onRefresh}
        onClearFilters={clearFilters}
      />
    </section>
  );
}
