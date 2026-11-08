import { useState } from "react";
import useGroups from "../../hooks/useGroups";
import GroupFilters from "./GroupFilters";
import GroupList from "./GroupList";
import GroupPagination from "./GroupPagination";

export default function GroupBrowser() {
  const [filters, setFilters] = useState({
    scope: "discover",
    page: 1,
    type: "",
    search: "",
    sort: "",
  });
  const { groups, pagination, loading, error, reload } = useGroups(filters);

  function changeFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  }

  return (
    <section className="space-y-4" aria-labelledby="discover-groups-title">
      <h3 id="discover-groups-title" className="text-xl font-semibold">Discover Groups</h3>
      <GroupFilters filters={filters} onChange={changeFilter} />
      <GroupList
        groups={groups}
        loading={loading}
        error={error}
        scope={filters.scope}
        onRetry={reload}
      />
      <GroupPagination
        pagination={pagination}
        loading={loading}
        onChange={(page) => setFilters((current) => ({ ...current, page }))}
      />
    </section>
  );
}
