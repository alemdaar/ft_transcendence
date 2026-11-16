import { useId } from "react";
export default function Input({ label, id, error, className = "", ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-fg">
          {label}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? inputId + "-error" : props["aria-describedby"]
        }
        className={"input " + (error ? "ring-red-500 " : "") + className}
      />
      {error && (
        <p
          id={inputId + "-error"}
          role="alert"
          className="text-sm text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}
