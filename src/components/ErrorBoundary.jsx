import { Component } from "react";
import { TriangleAlert } from "lucide-react";
import { EmptyState } from "./common/EmptyState";
import { Button } from "./common/Button";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled application error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto max-w-4xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <EmptyState
            icon={TriangleAlert}
            title="Não foi possível renderizar esta área"
            description="Atualize a página ou volte para a formação para continuar."
            action={
              <Button as="a" href="#/" variant="secondary">
                Voltar para formação
              </Button>
            }
          />
        </main>
      );
    }

    return this.props.children;
  }
}
