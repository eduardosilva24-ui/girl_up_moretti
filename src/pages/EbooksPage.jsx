import { BookOpen, Download } from "lucide-react";
import { useContentCollection } from "../hooks/useContentCollections";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { CardSkeleton } from "../components/common/Skeleton";
import { Button } from "../components/common/Button";

export default function EbooksPage() {
  const { items, isLoading } = useContentCollection("ebooks");

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="E-books"
        title="Biblioteca"
        description="Materiais publicados pela equipe administrativa ficarão disponíveis nesta página."
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
            icon={BookOpen}
            title="Nenhum e-book publicado"
            description="Os materiais aparecerão aqui quando forem cadastrados e publicados."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((ebook) => (
              <article key={ebook.id} className="rounded-[1.75rem] border border-aura-100 bg-white p-5 shadow-card">
                {ebook.coverUrl ? (
                  <img src={ebook.coverUrl} alt="" className="mb-5 aspect-[16/10] w-full rounded-3xl object-cover" />
                ) : null}
                <h2 className="text-xl font-semibold text-ink-900">{ebook.title}</h2>
                <p className="mt-3 text-sm leading-6 text-ink-600">{ebook.description}</p>
                {ebook.fileUrl ? (
                  <Button as="a" href={ebook.fileUrl} target="_blank" rel="noreferrer" className="mt-5" icon={Download}>
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
