import { Sparkles } from "lucide-react";

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  compact = false,
  className = "",
}) {
  return (
    <div
      className={`rounded-[2rem] border border-aura-100 bg-white/85 ${
        compact ? "p-6" : "p-8 sm:p-10"
      } text-center shadow-card ${className}`}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-aura-50 text-aura-700 ring-1 ring-aura-100">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <h2 className="mx-auto mt-5 max-w-xl text-xl font-semibold text-ink-900">{title}</h2>
      {description ? (
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ink-600">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
