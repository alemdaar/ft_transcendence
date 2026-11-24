export default function StudyModeSelector({ mode, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Study mode</legend>
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: "online", label: "Online" },
          { value: "insite", label: "On site" },
        ].map(({ value, label }) => (
          <label key={value} className="relative cursor-pointer">
            <input
              className="peer sr-only"
              type="radio"
              name="mode"
              value={value}
              checked={value === mode}
              onChange={(e) => onChange(e.target.value)}
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
