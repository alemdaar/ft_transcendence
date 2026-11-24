import { Search } from "lucide-react";

export default function GroupFilters({ filters, onChange }) {
  return (
    <div className="grid items-end gap-3 sm:grid-cols-[1fr_150px_160px]">
      <div className="relative">
        <label htmlFor="group-search" className="sr-only">Search by group name</label>
        <Search size={20} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input id="group-search" type="search" className="input filter-input min-h-12 pl-11"
          placeholder="Search by group name…" value={filters.search}
          onChange={event => onChange('search', event.target.value)} />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="group-type-filter"
          className="sr-only"
        >
          Group type
        </label>
        <select
          id="group-type-filter"
          className="input filter-input min-h-12"
          value={filters.type}
          onChange={(event) => onChange("type", event.target.value)}
        >
          <option value="">All types</option>
          <option value="general">General</option>
          <option value="team">Team</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="group-sort" className="sr-only">
          Sort by
        </label>
        <select
          id="group-sort"
          className="input filter-input min-h-12"
          value={filters.sort}
          onChange={(event) => onChange("sort", event.target.value)}
        >
          <option value="">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
    </div>
  );
}
