export default function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-semibold transition " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent " +
    "disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary: "bg-primary text-on-primary hover:bg-primary-hover",
    secondary: "border border-line bg-transparent text-fg hover:bg-soft",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}