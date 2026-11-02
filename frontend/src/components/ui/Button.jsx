export default function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  ...props
}) {
  const base =
                "rounded-xl bg-teal-600 px-4 py-3 text-sm " +
                "font-semibold text-white shadow-sm transition hover:bg-teal-700 "
                + "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2" 
                + "disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-600 "
                + "dark:hover:bg-teal-500 dark:focus:ring-offset-zinc-900";

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