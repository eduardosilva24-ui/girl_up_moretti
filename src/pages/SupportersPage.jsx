import { Handshake } from "lucide-react";
import { useContentCollection } from "../hooks/useContentCollections";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { CardSkeleton } from "../components/common/Skeleton";
import { Button } from "../components/common/Button";

export default function SupportersPage() {
  const { items, isLoading } = useContentCollection("supporters");

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Apoiadores"
        title="Rede de apoio"
        description="Apoiadores publicados pela equipe administrativa serão exibidos aqui."
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
            icon={Handshake}
            title="Nenhum apoiador publicado"
            description="Os apoiadores aparecerão aqui quando forem cadastrados e publicados."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((supporter) => (
              <article key={supporter.id} className="rounded-[1.75rem] border border-aura-100 bg-white p-5 shadow-card">
                {supporter.logoUrl ? (
                  <img src={supporter.logoUrl} alt="" className="mb-5 h-24 w-full rounded-3xl object-contain bg-aura-50 p-4" />
                ) : null}
                <h2 className="text-xl font-semibold text-ink-900">{supporter.name}</h2>
                <p className="mt-3 text-sm leading-6 text-ink-600">{supporter.description}</p>
                {supporter.websiteUrl ? (
                  <Button as="a" href={supporter.websiteUrl} target="_blank" rel="noreferrer" className="mt-5" variant="secondary">
                    Visitar
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
