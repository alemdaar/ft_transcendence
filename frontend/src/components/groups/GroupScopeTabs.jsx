const scopes = [
  { value: "mine", label: "My Groups" },
  { value: "pending", label: "Pending" },
  { value: "discover", label: "Discover" },
];

export default function GroupScopeTabs({ scope, onChange }) {
  return (
    <div
      role="group"
      aria-label="Group scope"
      className="flex gap-1 rounded-xl bg-soft p-1"
    >
      {scopes.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={scope === value}
          onClick={() => onChange(value)}
          className={
            "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition " +
            (scope === value
              ? "bg-surface text-highlight shadow-sm"
              : "text-muted hover:text-fg")
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
