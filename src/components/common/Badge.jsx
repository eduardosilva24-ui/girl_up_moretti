const VARIANTS = {
  default: "bg-aura-50 text-aura-800 ring-aura-100",
  success: "bg-sage-50 text-sage-700 ring-sage-100",
  warning: "bg-blush-50 text-blush-500 ring-blush-100",
  neutral: "bg-white text-ink-600 ring-aura-100",
};

export function Badge({ children, variant = "default", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
        VARIANTS[variant] || VARIANTS.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
