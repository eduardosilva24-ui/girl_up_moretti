import { Link, Navigate, useLocation } from "react-router-dom";
import { EmptyState } from "./common/EmptyState";
import { Button } from "./common/Button";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={ShieldAlert}
          title="Acesso restrito"
          description="Esta área é reservada para contas administrativas do domínio Girl Up Moretti."
          action={
            <Button as={Link} to="/" variant="secondary">
              Voltar para a formação
            </Button>
          }
        />
      </main>
    );
  }

  return children;
}
