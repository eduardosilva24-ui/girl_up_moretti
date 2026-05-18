import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { deletePost } from "../../services/blogService";
import { formatDate } from "../../utils/formatters";
import { useAuth } from "../../hooks/useAuth";
import { useBlog } from "../../hooks/useBlog";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { ConfirmModal } from "../../components/common/Modal";

export default function AdminPostsPage() {
  const { idToken } = useAuth();
  const { showToast } = useToast();
  const { posts, isLoading, mutate, refresh } = useBlog({ includeDrafts: true });
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDelete() {
    if (!deleting) return;

    setDeleteLoading(true);
    try {
      await deletePost(deleting.id, idToken);
      mutate((current) => current.filter((post) => post.id !== deleting.id));
      showToast({ type: "success", title: "Post removido" });
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
          <h2 className="text-2xl font-semibold text-ink-900">Blog</h2>
          <p className="mt-1 text-sm text-ink-600">Publique textos com comentários e curtidas.</p>
        </div>
        <Button as={Link} to="/admin/posts/novo" icon={Plus}>
          Novo post
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-[2rem] border border-aura-100 bg-white p-6 text-sm text-ink-600 shadow-card">
          Carregando posts...
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Nenhum post criado"
          description="As publicações criadas aqui aparecerão no blog após serem publicadas."
          action={
            <Button as={Link} to="/admin/posts/novo" icon={Plus}>
              Criar post
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
                  <th className="px-5 py-4">Curtidas</th>
                  <th className="px-5 py-4">Criado em</th>
                  <th className="px-5 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aura-100">
                {posts.map((post) => (
                  <tr key={post.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-ink-900">{post.title}</p>
                      <p className="mt-1 line-clamp-2 text-ink-600">{post.excerpt || post.content}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={post.published ? "success" : "warning"}>
                        {post.published ? "Publicado" : "Rascunho"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-ink-600">{Number(post.likes || 0)}</td>
                    <td className="px-5 py-4 text-ink-600">{formatDate(post.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button as={Link} to={`/admin/posts/${post.id}`} variant="secondary" size="sm" icon={Edit3}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleting(post)}>
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
        title="Remover post"
        description="Esta ação remove a publicação, seus comentários e curtidas."
        confirmLabel="Remover"
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
