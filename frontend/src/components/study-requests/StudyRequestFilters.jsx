import { Search } from 'lucide-react';

const campuses = ['Rabat', 'Med', 'Khouribga', 'Ben guerir'];

export default function StudyRequestFilters({ search, campus, onSearchChange, onCampusChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
      <div className="relative">
        <label className="sr-only" htmlFor="request-search">
          Search by topic or description
        </label>
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id="request-search"
          type="search"
          className="input filter-input pl-10"
          placeholder="Search by topic or description…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div>
        <label className="sr-only" htmlFor="request-campus">
          Filter by campus
        </label>
        <select
          id="request-campus"
          className="input filter-input h-full"
          value={campus}
          onChange={(event) => onCampusChange(event.target.value)}
        >
          <option value="">All campuses</option>
          {campuses.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
