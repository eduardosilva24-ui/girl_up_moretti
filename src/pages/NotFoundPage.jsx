import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { EmptyState } from "../components/common/EmptyState";
import { Button } from "../components/common/Button";

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-4xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={SearchX}
        title="Página não encontrada"
        description="O endereço acessado não corresponde a uma área disponível da plataforma."
        action={
          <Button as={Link} to="/" variant="secondary">
            Voltar para formação
          </Button>
        }
      />
    </main>
  );
}
