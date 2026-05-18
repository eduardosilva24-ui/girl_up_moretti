import { Link } from "react-router-dom";
import { Archive, BookOpen, LibraryBig, Newspaper, Plus } from "lucide-react";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { useModules } from "../../hooks/useModules";
import { useBlog } from "../../hooks/useBlog";
import { useContentCollection } from "../../hooks/useContentCollections";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[1.75rem] border border-aura-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aura-50 text-aura-700">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-600">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-ink-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { modules } = useModules({ includeDrafts: true });
  const { posts } = useBlog({ includeDrafts: true });
  const { items: ebooks } = useContentCollection("ebooks", { includeDrafts: true });
  const { items: recommendations } = useContentCollection("recommendations", { includeDrafts: true });
  const hasAnyContent = modules.length + posts.length + ebooks.length + recommendations.length > 0;

  return (
    <section className="min-w-0">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Módulos" value={modules.length} />
        <StatCard icon={Newspaper} label="Posts" value={posts.length} />
        <StatCard icon={Archive} label="E-books" value={ebooks.length} />
        <StatCard icon={LibraryBig} label="Indicações" value={recommendations.length} />
      </div>

      <div className="mt-6 rounded-[2rem] border border-aura-100 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-ink-900">Publicação de conteúdo</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              A plataforma pública permanece vazia até que itens sejam publicados por administradoras.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button as={Link} to="/admin/modulos/novo" icon={Plus}>
              Novo módulo
            </Button>
            <Button as={Link} to="/admin/posts/novo" variant="secondary" icon={Plus}>
              Novo post
            </Button>
          </div>
        </div>
      </div>

      {!hasAnyContent ? (
        <div className="mt-6">
          <EmptyState
            icon={BookOpen}
            title="Nenhum conteúdo criado"
            description="Crie o primeiro módulo, post ou item da biblioteca para começar a preencher a plataforma."
          />
        </div>
      ) : null}
    </section>
  );
}
