import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-aura-800 text-white shadow-card hover:bg-aura-700 focus-visible:outline-aura-700 disabled:bg-aura-200",
  secondary:
    "bg-white text-aura-800 ring-1 ring-aura-200 hover:bg-aura-50 focus-visible:outline-aura-700 disabled:text-aura-300",
  ghost:
    "bg-transparent text-ink-700 hover:bg-aura-50 hover:text-aura-900 focus-visible:outline-aura-700 disabled:text-ink-600/40",
  danger:
    "bg-blush-500 text-white shadow-card hover:bg-blush-400 focus-visible:outline-blush-500 disabled:bg-blush-200",
  subtle:
    "bg-aura-50 text-aura-800 hover:bg-aura-100 focus-visible:outline-aura-700 disabled:text-aura-300",
};

const SIZES = {
  sm: "h-9 gap-2 rounded-full px-3 text-sm",
  md: "h-11 gap-2.5 rounded-full px-5 text-sm",
  lg: "h-12 gap-3 rounded-full px-6 text-base",
  icon: "h-10 w-10 rounded-full p-0",
};

export function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  icon: Icon,
  children,
  className = "",
  loading = false,
  disabled,
  type = "button",
  ...props
}) {
  return (
    <Component
      type={Component === "button" ? type : undefined}
      className={`focus-ring inline-flex shrink-0 items-center justify-center font-semibold transition duration-200 ${
        VARIANTS[variant] || VARIANTS.primary
      } ${SIZES[size] || SIZES.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="h-4 w-4" aria-hidden="true" />
      ) : null}
      {children}
    </Component>
  );
}
