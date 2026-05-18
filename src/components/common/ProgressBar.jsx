import { toPercent } from "../../utils/formatters";

export function ProgressBar({ value = 0, label = "Progresso" }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-wide text-ink-600">
        <span>{label}</span>
        <span>{toPercent(value)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-aura-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-aura-700 via-blush-400 to-sage-500 transition-all duration-500"
          style={{ width: toPercent(value) }}
        />
      </div>
    </div>
  );
}
