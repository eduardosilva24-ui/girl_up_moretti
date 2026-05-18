import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, BookMarked, CheckCircle2, Lock, Video } from "lucide-react";
import { getModule } from "../services/moduleService";
import { useAuth } from "../hooks/useAuth";
import { useModules, useUserProgress } from "../hooks/useModules";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { EmptyState } from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import { YouTubeEmbed } from "../components/YouTubeEmbed";

function useModule(moduleId) {
  const [module, setModule] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getModule(moduleId, { signal: controller.signal })
      .then(setModule)
      .catch((nextError) => {
        if (nextError.name !== "AbortError") setError(nextError);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [moduleId]);

  return { module, error, loading };
}

export default function ModulePage() {
  const { moduleId } = useParams();
  const { isAuthenticated } = useAuth();
  const { modules } = useModules();
  const { progress } = useUserProgress();
  const { module, loading, error } = useModule(moduleId);

  const locked = useMemo(() => {
    if (!isAuthenticated || !modules.length) return false;
    const index = modules.findIndex((item) => item.id === moduleId);
    if (index <= 0) return false;
    const previous = modules[index - 1];
    return !progress.some((item) => item.moduleId === previous.id && item.completed);
  }, [isAuthenticated, moduleId, modules, progress]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="mt-8 h-52 w-full" />
      </main>
    );
  }

  if (error || !module) {
    return (
      <main className="mx-auto max-w-4xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={BookMarked}
          title="Módulo não encontrado"
          description="O conteúdo pode ter sido removido, despublicado ou ainda não estar disponível."
          action={
            <Button as={Link} to="/" variant="secondary">
              Voltar para formação
            </Button>
          }
        />
      </main>
    );
  }

  if (locked) {
    return (
      <main className="mx-auto max-w-4xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={Lock}
          title="Módulo bloqueado"
          description="Conclua o módulo anterior com aprovação para liberar esta etapa."
          action={
            <Button as={Link} to="/" variant="secondary">
              Ver módulos
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8 lg:py-14">
        <div>
          <Badge>Formação</Badge>
          <h1 className="mt-5 text-4xl font-semibold text-ink-900 sm:text-5xl">{module.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-600">{module.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button as={Link} to={isAuthenticated ? `/modulos/${module.id}/quiz` : "/login"} icon={ArrowRight}>
              {isAuthenticated ? "Fazer Quiz" : "Entrar para fazer quiz"}
            </Button>
            <Button as={Link} to="/" variant="secondary">
              Voltar
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-aura-100 bg-aura-50 shadow-soft">
          {module.imageUrl ? (
            <img src={module.imageUrl} alt="" className="h-full min-h-72 w-full object-cover" />
          ) : (
            <div className="flex min-h-72 items-center justify-center text-aura-700">
              <BookMarked className="h-14 w-14" aria-hidden="true" />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.7fr)] lg:px-8">
        <article className="rounded-[2rem] border border-aura-100 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge variant="neutral">
              <BookMarked className="mr-2 h-3.5 w-3.5" />
              Leitura
            </Badge>
            <Badge variant="neutral">
              <Video className="mr-2 h-3.5 w-3.5" />
              Vídeo
            </Badge>
            <Badge variant="neutral">
              <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
              Quiz
            </Badge>
          </div>
          <div className="content-body">{module.content}</div>
        </article>
        <div className="space-y-6">
          <YouTubeEmbed url={module.videoUrl} title={module.title} />
          <div className="rounded-[2rem] border border-aura-100 bg-white p-5 shadow-card">
            <h2 className="text-xl font-semibold text-ink-900">Quiz do módulo</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              A aprovação exige pontuação mínima de 60%.
            </p>
            <Button
              as={Link}
              to={isAuthenticated ? `/modulos/${module.id}/quiz` : "/login"}
              className="mt-5 w-full"
              icon={ArrowRight}
            >
              {isAuthenticated ? "Fazer Quiz" : "Entrar para fazer quiz"}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
