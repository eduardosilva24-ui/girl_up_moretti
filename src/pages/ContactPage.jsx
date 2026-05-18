import { Mail } from "lucide-react";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";

export default function ContactPage() {
  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Contato"
        title="Canais oficiais"
        description="Os canais de contato oficiais serão exibidos quando forem definidos pela equipe."
      />
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={Mail}
          title="Contato ainda não configurado"
          description="Nenhum canal oficial foi publicado para esta plataforma."
        />
      </section>
    </main>
  );
}
