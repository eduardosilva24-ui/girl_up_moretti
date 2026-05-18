import { useMemo, useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import {
  createCollectionItem,
  deleteCollectionItem,
  updateCollectionItem,
} from "../../services/contentService";
import { useAuth } from "../../hooks/useAuth";
import { useContentCollection } from "../../hooks/useContentCollections";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { FormField, inputClassName } from "../../components/common/FormField";
import { ConfirmModal, Modal } from "../../components/common/Modal";

const CONFIG = {
  ebooks: {
    title: "E-books",
    singular: "e-book",
    empty: { id: "", title: "", description: "", fileUrl: "", coverUrl: "", published: true },
    columns: ["title", "description", "fileUrl", "coverUrl"],
    labels: {
      title: "Título",
      description: "Descrição",
      fileUrl: "Arquivo",
      coverUrl: "Capa",
    },
    required: ["title", "description", "fileUrl"],
    primaryField: "title",
  },
  recommendations: {
    title: "Indicações",
    singular: "indicação",
    empty: { id: "", title: "", description: "", url: "", category: "", published: true },
    columns: ["title", "description", "url", "category"],
    labels: {
      title: "Título",
      description: "Descrição",
      url: "Link",
      category: "Categoria",
    },
    required: ["title", "description", "url"],
    primaryField: "title",
  },
  supporters: {
    title: "Apoiadores",
    singular: "apoiador",
    empty: { id: "", name: "", description: "", websiteUrl: "", logoUrl: "", published: true },
    columns: ["name", "description", "websiteUrl", "logoUrl"],
    labels: {
      name: "Nome",
      description: "Descrição",
      websiteUrl: "Site",
      logoUrl: "Logo",
    },
    required: ["name", "description"],
    primaryField: "name",
  },
};

function normalizeItem(item) {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
  );
}

function validateItem(item, config) {
  return config.required.every((field) => String(item[field] || "").trim().length > 0);
}

export default function AdminCollectionsPage() {
  const [active, setActive] = useState("ebooks");
  const config = CONFIG[active];
  const { idToken } = useAuth();
  const { showToast } = useToast();
  const { items, isLoading, mutate, refresh } = useContentCollection(active, { includeDrafts: true });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const formValid = useMemo(() => (editing ? validateItem(editing, config) : false), [config, editing]);

  function openCreate() {
    setEditing({ ...config.empty });
  }

  function openEdit(item) {
    setEditing({ ...config.empty, ...item, published: item.published !== false });
  }

  function updateField(field, value) {
    setEditing((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    const payload = normalizeItem(editing);
    if (!validateItem(payload, config)) {
      showToast({
        type: "error",
        title: "Item incompleto",
        message: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    setSaving(true);
    try {
      const saved = payload.id
        ? await updateCollectionItem(active, payload, idToken)
        : await createCollectionItem(active, payload, idToken);

      mutate((current) => {
        if (payload.id) {
          return current.map((item) => (item.id === saved.id ? saved : item));
        }
        return [saved, ...current];
      });

      showToast({ type: "success", title: "Item salvo" });
      setEditing(null);
      refresh();
    } catch (error) {
      showToast({
        type: "error",
        title: "Não foi possível salvar",
        message: error.message || "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;

    setDeleteLoading(true);
    try {
      await deleteCollectionItem(active, deleting.id, idToken);
      mutate((current) => current.filter((item) => item.id !== deleting.id));
      showToast({ type: "success", title: "Item removido" });
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
          <h2 className="text-2xl font-semibold text-ink-900">Biblioteca</h2>
          <p className="mt-1 text-sm text-ink-600">Gerencie e-books, indicações e apoiadores.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Novo item
        </Button>
      </div>

      <div className="mb-5 grid gap-2 rounded-[2rem] border border-aura-100 bg-white p-2 shadow-card sm:grid-cols-3">
        {Object.entries(CONFIG).map(([key, item]) => (
          <button
            key={key}
            type="button"
            className={`focus-ring rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              active === key ? "bg-aura-800 text-white" : "text-ink-700 hover:bg-aura-50"
            }`}
            onClick={() => setActive(key)}
          >
            {item.title}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-[2rem] border border-aura-100 bg-white p-6 text-sm text-ink-600 shadow-card">
          Carregando itens...
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Plus}
          title={`Nenhum ${config.singular} criado`}
          description="Os itens publicados ficarão visíveis nas páginas públicas correspondentes."
          action={
            <Button icon={Plus} onClick={openCreate}>
              Criar item
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-[1.75rem] border border-aura-100 bg-white p-5 shadow-card">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-ink-900">{item[config.primaryField]}</h3>
                    <Badge variant={item.published ? "success" : "warning"}>
                      {item.published ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink-600">{item.description}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" size="sm" icon={Edit3} onClick={() => openEdit(item)}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleting(item)}>
                    Remover
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        title={editing?.id ? `Editar ${config.singular}` : `Novo ${config.singular}`}
        description="Campos marcados com asterisco são obrigatórios."
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={saving} disabled={!formValid}>
              Salvar
            </Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-4">
            {config.columns.map((field) => (
              <FormField
                key={field}
                label={config.labels[field]}
                id={field}
                required={config.required.includes(field)}
              >
                {field === "description" ? (
                  <textarea
                    id={field}
                    className={`${inputClassName} min-h-28 resize-y`}
                    value={editing[field] || ""}
                    onChange={(event) => updateField(field, event.target.value)}
                  />
                ) : (
                  <input
                    id={field}
                    className={inputClassName}
                    value={editing[field] || ""}
                    onChange={(event) => updateField(field, event.target.value)}
                    placeholder={field.toLowerCase().includes("url") ? "https://..." : ""}
                  />
                )}
              </FormField>
            ))}
            <label className="inline-flex items-center gap-3 text-sm font-semibold text-ink-800">
              <input
                type="checkbox"
                className="h-5 w-5 rounded accent-aura-700"
                checked={editing.published}
                onChange={(event) => updateField("published", event.target.checked)}
              />
              Publicado
            </label>
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        open={Boolean(deleting)}
        title="Remover item"
        description="Esta ação remove o item selecionado da biblioteca."
        confirmLabel="Remover"
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
