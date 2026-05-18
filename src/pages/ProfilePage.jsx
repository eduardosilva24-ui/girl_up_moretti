import { Link } from "react-router-dom";
import { Shield, UserRound } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useModules, useUserProgress } from "../hooks/useModules";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { ProgressBar } from "../components/common/ProgressBar";
import { Button } from "../components/common/Button";

export default function ProfilePage() {
  const { user, isAdmin, logout } = useAuth();
  const { modules } = useModules();
  const { progress } = useUserProgress();
  const completed = progress.filter((item) => item.completed).length;
  const progressMap = new Map(progress.map((item) => [item.moduleId, item]));

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Perfil"
        title={user?.name || "Usuária"}
        description={user?.email}
        actions={
          <>
            {isAdmin ? (
              <Button as={Link} to="/admin" icon={Shield}>
                Painel Admin
              </Button>
            ) : null}
            <Button variant="secondary" onClick={logout}>
              Sair
            </Button>
          </>
        }
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-[2rem] border border-aura-100 bg-white p-6 shadow-card">
          {user?.picture ? (
            <img src={user.picture} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-aura-100 text-aura-800">
              <UserRound className="h-9 w-9" aria-hidden="true" />
            </div>
          )}
          <h2 className="mt-5 text-xl font-semibold text-ink-900">{user?.name}</h2>
          <p className="mt-1 break-all text-sm text-ink-600">{user?.email}</p>
          <div className="mt-5 rounded-3xl bg-aura-50 p-4 text-sm font-semibold text-aura-800">
            {isAdmin ? "Administradora" : "Usuária"}
          </div>
        </aside>

        <section className="rounded-[2rem] border border-aura-100 bg-white p-6 shadow-card">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-ink-900">Progresso</h2>
              <p className="mt-1 text-sm text-ink-600">
                {completed} de {modules.length} módulos concluídos
              </p>
            </div>
          </div>
          <div className="mt-6">
            <ProgressBar value={modules.length ? (completed / modules.length) * 100 : 0} label="Formação" />
          </div>

          <div className="mt-6 space-y-3">
            {modules.length === 0 ? (
              <EmptyState
                compact
                title="Nenhum módulo publicado ainda"
                description="Seu progresso aparecerá quando houver formações disponíveis."
              />
            ) : (
              modules.map((module) => {
                const item = progressMap.get(module.id);
                return (
                  <div
                    key={module.id}
                    className="flex flex-col gap-3 rounded-3xl border border-aura-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-ink-900">{module.title}</h3>
                      <p className="mt-1 text-sm text-ink-600">
                        {item?.completed ? `Concluído com ${item.score}%` : "Ainda não concluído"}
                      </p>
                    </div>
                    <Button as={Link} to={`/modulos/${module.id}`} variant="secondary">
                      Abrir
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
