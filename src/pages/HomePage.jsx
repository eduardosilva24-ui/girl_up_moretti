import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { Button } from "../components/common/Button";
import { CardSkeleton } from "../components/common/Skeleton";
import { EmptyState } from "../components/common/EmptyState";
import { ProgressBar } from "../components/common/ProgressBar";
import { ModuleCard } from "../components/ModuleCard";
import { useAuth } from "../hooks/useAuth";
import { useModules, useUserProgress } from "../hooks/useModules";

function getProgressMap(progress) {
  return new Map(progress.map((item) => [item.moduleId, item]));
}

function getModuleProgress(module, progressMap) {
  const item = progressMap.get(module.id);
  if (!item) return 0;
  return item.completed ? 100 : Number(item.score || 0);
}

function isModuleLocked(index, modules, progressMap, isAuthenticated) {
  if (!isAuthenticated || index === 0) return false;
  const previous = modules[index - 1];
  return !progressMap.get(previous.id)?.completed;
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { modules, isLoading, isRefreshing } = useModules();
  const { progress } = useUserProgress();
  const progressMap = getProgressMap(progress);
  const completedCount = modules.filter((module) => progressMap.get(module.id)?.completed).length;
  const overallProgress = modules.length ? (completedCount / modules.length) * 100 : 0;

  return (
    <main className="flex-1">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:px-8 lg:py-14">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-aura-700">Formação</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal text-ink-900 sm:text-6xl">
            Girl Up Áurea Moretti Platform
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-ink-600 sm:text-lg">
            Uma plataforma educacional para publicar, organizar e acompanhar formações criadas pela equipe administrativa.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <Button as={Link} to="/perfil" icon={GraduationCap}>
                Ver progresso
              </Button>
            ) : (
              <Button as={Link} to="/login" icon={GraduationCap}>
                Entrar para acompanhar
              </Button>
            )}
            <Button as={Link} to="/blog" variant="secondary" icon={BookOpen}>
              Ler blog
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-aura-100 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blush-50 text-blush-500">
              <Sparkles className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-600">Progresso geral</p>
              <p className="mt-1 text-2xl font-semibold text-ink-900">
                {completedCount} de {modules.length} módulos
              </p>
            </div>
          </div>
          <div className="mt-6">
            <ProgressBar value={overallProgress} label="Formação" />
          </div>
          <div className="mt-6 rounded-3xl bg-aura-50 p-4 text-sm leading-6 text-ink-700">
            {modules.length === 0
              ? "Os módulos publicados aparecerão aqui assim que forem criados."
              : "A conclusão de um quiz aprovado libera o próximo módulo da sequência."}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-aura-700">Módulos</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink-900 sm:text-3xl">Formações publicadas</h2>
          </div>
          {isRefreshing ? <span className="text-sm font-medium text-ink-600">Atualizando...</span> : null}
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : modules.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhum módulo publicado ainda"
            description="Quando a equipe administrativa publicar a primeira formação, ela será exibida nesta área."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                progress={getModuleProgress(module, progressMap)}
                locked={isModuleLocked(index, modules, progressMap, isAuthenticated)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
