import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { createPost, getPost, updatePost } from "../../services/blogService";
import { validatePostForm } from "../../utils/validation";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/formatters";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { FormField, inputClassName } from "../../components/common/FormField";
import { Skeleton } from "../../components/common/Skeleton";

function createEmptyPost() {
  return {
    id: "",
    title: "",
    content: "",
    imageUrl: "",
    published: true,
  };
}

function normalizePost(post) {
  return {
    id: post.id || "",
    title: post.title.trim(),
    content: post.content.trim(),
    imageUrl: post.imageUrl?.trim() || "",
    published: Boolean(post.published),
  };
}

export default function AdminPostEditorPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { idToken } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(createEmptyPost);
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(postId);
  const validation = useMemo(() => validatePostForm(form), [form]);

  useEffect(() => {
    if (!postId) return undefined;

    const controller = new AbortController();
    setLoading(true);
    getPost(postId, { idToken, signal: controller.signal })
      .then((post) => setForm({ ...createEmptyPost(), ...post, published: post.published !== false }))
      .catch(() => {
        showToast({
          type: "error",
          title: "Post não encontrado",
          message: "Não foi possível carregar esta publicação.",
        });
        navigate("/admin/posts", { replace: true });
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [idToken, navigate, postId, showToast]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    const payload = normalizePost(form);
    if (!validatePostForm(payload).valid) {
      showToast({
        type: "error",
        title: "Post incompleto",
        message: "Título e conteúdo são obrigatórios.",
      });
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updatePost(payload, idToken);
      } else {
        await createPost(payload, idToken);
      }
      showToast({ type: "success", title: isEditing ? "Post atualizado" : "Post criado" });
      navigate("/admin/posts");
    } catch (error) {
      showToast({
        type: "error",
        title: "Não foi possível salvar",
        message: error.message || "Revise os campos e tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="min-w-0">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="mt-5 h-[520px] w-full" />
      </section>
    );
  }

  return (
    <section className="min-w-0">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button as={Link} to="/admin/posts" variant="ghost" icon={ArrowLeft} className="-ml-3">
            Blog
          </Button>
          <h2 className="mt-2 text-2xl font-semibold text-ink-900">{isEditing ? "Editar post" : "Novo post"}</h2>
        </div>
        <Badge variant={validation.valid ? "success" : "warning"}>
          {validation.valid ? "Pronto para salvar" : "Incompleto"}
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.65fr)]">
        <div className="rounded-[2rem] border border-aura-100 bg-white p-5 shadow-card sm:p-7">
          <div className="grid gap-5">
            <FormField label="Título" id="title" required>
              <input
                id="title"
                className={inputClassName}
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                maxLength={160}
              />
            </FormField>
            <FormField label="Imagem" id="imageUrl">
              <input
                id="imageUrl"
                className={inputClassName}
                value={form.imageUrl}
                onChange={(event) => updateField("imageUrl", event.target.value)}
                placeholder="https://..."
              />
            </FormField>
            <FormField label="Conteúdo" id="content" required>
              <textarea
                id="content"
                className={`${inputClassName} min-h-[420px] resize-y leading-7`}
                value={form.content}
                onChange={(event) => updateField("content", event.target.value)}
              />
            </FormField>
            <label className="inline-flex items-center gap-3 text-sm font-semibold text-ink-800">
              <input
                type="checkbox"
                className="h-5 w-5 rounded accent-aura-700"
                checked={form.published}
                onChange={(event) => updateField("published", event.target.checked)}
              />
              Publicado
            </label>
            <div className="flex justify-end border-t border-aura-100 pt-5">
              <Button icon={Save} loading={saving} disabled={!validation.valid} onClick={handleSave}>
                {form.published ? "Publicar" : "Salvar"}
              </Button>
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-aura-100 bg-white p-5 shadow-card sm:p-6">
          <Badge>Preview</Badge>
          {form.imageUrl ? (
            <img src={form.imageUrl} alt="" className="mt-5 aspect-[16/9] w-full rounded-3xl object-cover" />
          ) : null}
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-aura-700">
            {formatDate(new Date().toISOString())}
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-ink-900">{form.title || "Título do post"}</h3>
          <div className="content-body mt-4">{form.content || "Conteúdo do post"}</div>
        </aside>
      </div>
    </section>
  );
}
