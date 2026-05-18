import { ExternalLink, LibraryBig } from "lucide-react";
import { useContentCollection } from "../hooks/useContentCollections";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { CardSkeleton } from "../components/common/Skeleton";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";

export default function RecommendationsPage() {
  const { items, isLoading } = useContentCollection("recommendations");

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Indicações"
        title="Curadoria"
        description="Indicações publicadas pela equipe administrativa serão exibidas nesta área."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={LibraryBig}
            title="Nenhuma indicação publicada"
            description="As recomendações aparecerão aqui quando forem cadastradas e publicadas."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-[1.75rem] border border-aura-100 bg-white p-5 shadow-card">
                {item.category ? <Badge>{item.category}</Badge> : null}
                <h2 className="mt-4 text-xl font-semibold text-ink-900">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-ink-600">{item.description}</p>
                {item.url ? (
                  <Button as="a" href={item.url} target="_blank" rel="noreferrer" className="mt-5" icon={ExternalLink}>
                    Abrir
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
