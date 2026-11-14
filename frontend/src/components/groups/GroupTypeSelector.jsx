export default function GroupTypeSelector({ type, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Group type</legend>
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: "general", label: "General" },
          { value: "team", label: "Team" },
        ].map(({ value, label }) => (
          <label key={value} className="relative cursor-pointer">
            <input
              type="radio"
              name="group-type"
              className="peer sr-only"
              value={value}
              checked={type === value}
              onChange={(event) => onChange(event.target.value)}
            />
            <span className="flex items-center justify-center rounded-xl border border-line px-4 py-3 text-sm font-semibold text-muted transition peer-checked:border-highlight peer-checked:bg-selected peer-checked:text-highlight peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500">
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
