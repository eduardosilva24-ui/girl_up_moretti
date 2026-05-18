import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "./common/Button";

const OPTIONS = [
  ["A", "optionA"],
  ["B", "optionB"],
  ["C", "optionC"],
  ["D", "optionD"],
];

export function QuizForm({ questions = [], onSubmit, loading = false }) {
  const [answers, setAnswers] = useState({});

  const allAnswered = useMemo(
    () => questions.length > 0 && questions.every((question) => answers[question.id]),
    [answers, questions],
  );

  function handleSubmit(event) {
    event.preventDefault();
    if (!allAnswered) return;
    onSubmit?.(answers);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {questions.map((question, index) => (
        <fieldset key={question.id} className="rounded-[1.75rem] border border-aura-100 bg-white p-5 shadow-card">
          <legend className="text-base font-semibold text-ink-900">
            {index + 1}. {question.question}
          </legend>
          <div className="mt-4 grid gap-3">
            {OPTIONS.map(([label, field]) => {
              const inputId = `${question.id}-${label}`;
              const selected = answers[question.id] === label;

              return (
                <label
                  key={field}
                  htmlFor={inputId}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm leading-6 transition ${
                    selected
                      ? "border-aura-500 bg-aura-50 text-aura-900"
                      : "border-aura-100 bg-white text-ink-700 hover:border-aura-200 hover:bg-aura-50/60"
                  }`}
                >
                  <input
                    id={inputId}
                    className="mt-1 h-4 w-4 accent-aura-700"
                    type="radio"
                    name={question.id}
                    value={label}
                    checked={selected}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: label }))}
                  />
                  <span>
                    <span className="font-semibold">{label}.</span> {question[field]}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="sticky bottom-4 z-10 flex justify-end rounded-full bg-white/80 p-2 shadow-card backdrop-blur">
        <Button type="submit" icon={CheckCircle2} loading={loading} disabled={!allAnswered}>
          Finalizar quiz
        </Button>
      </div>
    </form>
  );
}
