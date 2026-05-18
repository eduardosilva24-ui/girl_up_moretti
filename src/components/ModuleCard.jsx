import { memo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Lock, PlayCircle } from "lucide-react";
import { Badge } from "./common/Badge";
import { ProgressBar } from "./common/ProgressBar";

export const ModuleCard = memo(function ModuleCard({ module, progress = 0, locked = false }) {
  const Wrapper = locked ? "div" : Link;
  const wrapperProps = locked ? {} : { to: `/modulos/${module.id}` };

  return (
    <Wrapper
      {...wrapperProps}
      className={`group block overflow-hidden rounded-[1.75rem] border border-aura-100 bg-white shadow-card transition duration-300 ${
        locked ? "opacity-75" : "hover:-translate-y-1 hover:border-aura-200 hover:shadow-soft"
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-aura-50">
        {module.imageUrl ? (
          <img
            src={module.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-aura-50 text-aura-700">
            <BookOpen className="h-12 w-12" aria-hidden="true" />
          </div>
        )}
        <div className="absolute left-4 top-4">
          <Badge variant={locked ? "warning" : progress >= 100 ? "success" : "neutral"}>
            {locked ? "Bloqueado" : progress >= 100 ? "Concluído" : "Desbloqueado"}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-aura-50 text-aura-700">
            {locked ? <Lock className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-lg font-semibold text-ink-900">{module.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-600">{module.description}</p>
          </div>
        </div>
        <div className="mt-5">
          <ProgressBar value={progress} />
        </div>
      </div>
    </Wrapper>
  );
});
