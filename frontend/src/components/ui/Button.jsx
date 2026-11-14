export default function Button({
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  children,
  ...props
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "btn-danger",
  };
  return (
    <button
      {...props}
      type={type}
      className={`${variants[variant] || variants.primary} ${className}`}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
