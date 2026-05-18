import { UsersRound } from "lucide-react";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";

export default function AboutPage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Quem Somos"
        title="Página institucional"
        description="O conteúdo institucional será publicado pela equipe responsável pela plataforma."
      />
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={UsersRound}
          title="Conteúdo institucional ainda não publicado"
          description="Esta área permanece vazia até que as informações oficiais sejam cadastradas."
        />
      </section>
    </main>
  );
}
