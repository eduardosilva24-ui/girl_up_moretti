import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Award, ClipboardCheck } from "lucide-react";
import { getModule } from "../services/moduleService";
import { PASSING_SCORE, REQUIRED_QUIZ_QUESTION_COUNT } from "../utils/constants";
import { useQuiz } from "../hooks/useQuiz";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import { QuizForm } from "../components/QuizForm";

export default function QuizPage() {
  const { moduleId } = useParams();
  const { showToast } = useToast();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const { submitQuiz, isSubmitting, result } = useQuiz(moduleId);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getModule(moduleId, { signal: controller.signal })
      .then(setModule)
      .catch(() => setModule(null))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [moduleId]);

  async function handleSubmit(answers) {
    try {
      await submitQuiz(answers);
    } catch (error) {
      showToast({
        type: "error",
        title: "Quiz não finalizado",
        message: error.message || "Tente novamente em alguns instantes.",
      });
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="mt-6 h-96 w-full" />
      </main>
    );
  }

  if (!module || !Array.isArray(module.quizQuestions) || module.quizQuestions.length !== REQUIRED_QUIZ_QUESTION_COUNT) {
    return (
      <main className="mx-auto max-w-4xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={ClipboardCheck}
          title="Quiz indisponível"
          description="Este módulo ainda não possui um quiz completo publicado."
          action={
            <Button as={Link} to="/" variant="secondary">
              Voltar para formação
            </Button>
          }
        />
      </main>
    );
  }

  if (result) {
    const approved = result.score >= PASSING_SCORE || result.completed;

    return (
      <main className="mx-auto max-w-4xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={Award}
          title={approved ? "Parabéns, módulo concluído" : "Continue tentando"}
          description={
            approved
              ? `Sua pontuação foi ${result.score}%. O próximo módulo foi liberado.`
              : `Sua pontuação foi ${result.score}%. A aprovação exige no mínimo ${PASSING_SCORE}%.`
          }
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button as={Link} to="/" variant="secondary">
                Ver formação
              </Button>
              {!approved ? (
                <Button as={Link} to={`/modulos/${moduleId}`}>
                  Revisar módulo
                </Button>
              ) : null}
            </div>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-aura-700">Quiz</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink-900 sm:text-4xl">{module.title}</h1>
        <p className="mt-3 text-sm leading-6 text-ink-600">Responda as 5 perguntas para salvar seu progresso.</p>
      </header>
      <QuizForm questions={module.quizQuestions} onSubmit={handleSubmit} loading={isSubmitting} />
    </main>
  );
}
