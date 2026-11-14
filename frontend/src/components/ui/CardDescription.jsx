export default function CardDescription({ children, expanded = false }) {
  return (
    <p
      className={`mt-3 text-sm leading-6 text-muted ${expanded ? "whitespace-pre-wrap break-words" : "truncate h-6"}`}
    >
      {children}
    </p>
  );
}
