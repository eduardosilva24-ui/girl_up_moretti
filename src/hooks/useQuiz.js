import { useCallback, useState } from "react";
import { PASSING_SCORE } from "../utils/constants";
import { saveProgress } from "../services/progressService";
import { useAuth } from "./useAuth";

export function useQuiz(moduleId) {
  const { idToken } = useAuth();
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submitQuiz = useCallback(
    async (answers) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const nextResult = await saveProgress(moduleId, answers, idToken);
        setResult({
          ...nextResult,
          completed: Boolean(nextResult.completed || nextResult.score >= PASSING_SCORE),
        });
        return nextResult;
      } catch (nextError) {
        setError(nextError);
        throw nextError;
      } finally {
        setIsSubmitting(false);
      }
    },
    [idToken, moduleId],
  );

  return {
    result,
    isSubmitting,
    error,
    submitQuiz,
    resetResult: () => setResult(null),
  };
}
