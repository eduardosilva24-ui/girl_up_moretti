import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { deleteModule } from "../../services/moduleService";
import { formatDate } from "../../utils/formatters";
import { useAuth } from "../../hooks/useAuth";
import { useModules } from "../../hooks/useModules";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmModal } from "../../components/common/Modal";

export default function AdminModulesPage() {
  const { idToken } = useAuth();
  const { showToast } = useToast();
  const { modules, isLoading, mutate, refresh } = useModules({ includeDrafts: true });
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDelete() {
    if (!deleting) return;

    setDeleteLoading(true);
    try {
      await deleteModule(deleting.id, idToken);
      mutate((current) => current.filter((module) => module.id !== deleting.id));
      showToast({ type: "success", title: "Módulo removido" });
      setDeleting(null);
      refresh();
    } catch (error) {
      showToast({
        type: "error",
        title: "Não foi possível remover",
        message: error.message || "Tente novamente.",
      });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <section className="min-w-0">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink-900">Módulos</h2>
          <p className="mt-1 text-sm text-ink-600">Crie e edite formações completas com vídeo e quiz.</p>
        </div>
        <Button as={Link} to="/admin/modulos/novo" icon={Plus}>
          Novo módulo
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-[2rem] border border-aura-100 bg-white p-6 text-sm text-ink-600 shadow-card">
          Carregando módulos...
        </div>
      ) : modules.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Nenhum módulo criado"
          description="Use o fluxo guiado para publicar a primeira formação."
          action={
            <Button as={Link} to="/admin/modulos/novo" icon={Plus}>
              Criar módulo
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-aura-100 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-aura-50 text-xs font-semibold uppercase tracking-[0.14em] text-aura-800">
                <tr>
                  <th className="px-5 py-4">Título</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Criado em</th>
                  <th className="px-5 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aura-100">
                {modules.map((module) => (
                  <tr key={module.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-ink-900">{module.title}</p>
                      <p className="mt-1 line-clamp-2 text-ink-600">{module.description}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={module.published ? "success" : "warning"}>
                        {module.published ? "Publicado" : "Rascunho"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-ink-600">{formatDate(module.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button as={Link} to={`/admin/modulos/${module.id}`} variant="secondary" size="sm" icon={Edit3}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleting(module)}>
                          Remover
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleting)}
        title="Remover módulo"
        description="Esta ação remove o módulo, suas perguntas e progressos associados."
        confirmLabel="Remover"
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
