export function FormField({
  label,
  id,
  error,
  hint,
  children,
  required = false,
  className = "",
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink-800">
        {label}
        {required ? <span className="text-blush-500"> *</span> : null}
      </label>
      <div className="mt-2">{children}</div>
      {hint && !error ? <p className="mt-2 text-xs leading-5 text-ink-600">{hint}</p> : null}
      {error ? <p className="mt-2 text-xs font-medium text-blush-500">{error}</p> : null}
    </div>
  );
}

export const inputClassName =
  "focus-ring w-full rounded-2xl border border-aura-100 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm transition placeholder:text-ink-600/45 hover:border-aura-200";
