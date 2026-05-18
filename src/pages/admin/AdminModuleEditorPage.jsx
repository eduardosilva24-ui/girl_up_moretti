import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Eye, Image, ListChecks, Save, Video } from "lucide-react";
import { createModule, getModule, updateModule } from "../../services/moduleService";
import {
  createEmptyQuiz,
  normalizeModulePayload,
  validateModuleForm,
  validateQuizQuestion,
} from "../../utils/validation";
import { REQUIRED_QUIZ_QUESTION_COUNT } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { FormField, inputClassName } from "../../components/common/FormField";
import { Skeleton } from "../../components/common/Skeleton";
import { YouTubeEmbed } from "../../components/YouTubeEmbed";

const STEPS = [
  { label: "Identidade", icon: Image },
  { label: "Texto", icon: ListChecks },
  { label: "Vídeo", icon: Video },
  { label: "Quiz", icon: Check },
  { label: "Preview", icon: Eye },
];

function createEmptyModule() {
  return {
    id: "",
    title: "",
    description: "",
    imageUrl: "",
    content: "",
    videoUrl: "",
    published: true,
    quizQuestions: createEmptyQuiz(),
  };
}

function mergeModule(module) {
  const empty = createEmptyModule();
  const questions = createEmptyQuiz().map((question, index) => ({
    ...question,
    ...(module.quizQuestions?.[index] || {}),
  }));

  return {
    ...empty,
    ...module,
    published: module.published !== false,
    quizQuestions: questions,
  };
}

export default function AdminModuleEditorPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { idToken } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(createEmptyModule);
  const [loading, setLoading] = useState(Boolean(moduleId));
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(moduleId);
  const validation = useMemo(() => validateModuleForm(form), [form]);

  useEffect(() => {
    if (!moduleId) return undefined;

    const controller = new AbortController();
    setLoading(true);
    getModule(moduleId, { idToken, signal: controller.signal })
      .then((module) => setForm(mergeModule(module)))
      .catch(() => {
        showToast({
          type: "error",
          title: "Módulo não encontrado",
          message: "Não foi possível carregar este módulo para edição.",
        });
        navigate("/admin/modulos", { replace: true });
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [idToken, moduleId, navigate, showToast]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateQuestion(index, field, value) {
    setForm((current) => ({
      ...current,
      quizQuestions: current.quizQuestions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question,
      ),
    }));
  }

  function isStepValid(stepIndex) {
    if (stepIndex === 0) return validation.title && validation.description && validation.imageUrl;
    if (stepIndex === 1) return validation.content;
    if (stepIndex === 2) return validation.videoUrl;
    if (stepIndex === 3) return validation.quiz;
    return validation.valid;
  }

  async function handleSave() {
    const payload = normalizeModulePayload(form);
    const payloadValidation = validateModuleForm(payload);

    if (!payloadValidation.valid) {
      showToast({
        type: "error",
        title: "Módulo incompleto",
        message: "Preencha imagem, texto, vídeo do YouTube e exatamente 5 perguntas completas.",
      });
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updateModule(payload, idToken);
      } else {
        await createModule(payload, idToken);
      }
      showToast({ type: "success", title: isEditing ? "Módulo atualizado" : "Módulo publicado" });
      navigate("/admin/modulos");
    } catch (error) {
      showToast({
        type: "error",
        title: "Não foi possível salvar",
        message: error.message || "Revise os campos e tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="min-w-0">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="mt-5 h-[520px] w-full" />
      </section>
    );
  }

  return (
    <section className="min-w-0">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button as={Link} to="/admin/modulos" variant="ghost" icon={ArrowLeft} className="-ml-3">
            Módulos
          </Button>
          <h2 className="mt-2 text-2xl font-semibold text-ink-900">
            {isEditing ? "Editar módulo" : "Novo módulo"}
          </h2>
        </div>
        <Badge variant={validation.valid ? "success" : "warning"}>
          {validation.valid ? "Pronto para publicar" : "Incompleto"}
        </Badge>
      </div>

      <div className="mb-5 overflow-hidden rounded-[2rem] border border-aura-100 bg-white p-2 shadow-card">
        <div className="grid gap-2 md:grid-cols-5">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            const active = step === index;
            const complete = isStepValid(index);

            return (
              <button
                key={item.label}
                type="button"
                className={`focus-ring flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-aura-800 text-white"
                    : complete
                      ? "bg-sage-50 text-sage-700"
                      : "text-ink-600 hover:bg-aura-50"
                }`}
                onClick={() => setStep(index)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[2rem] border border-aura-100 bg-white p-5 shadow-card sm:p-7">
        {step === 0 ? (
          <div className="grid gap-5">
            <FormField label="Título" id="title" required>
              <input
                id="title"
                className={inputClassName}
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                maxLength={140}
              />
            </FormField>
            <FormField label="Descrição" id="description" required>
              <textarea
                id="description"
                className={`${inputClassName} min-h-28 resize-y`}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                maxLength={360}
              />
            </FormField>
            <FormField label="Imagem de capa" id="imageUrl" required>
              <input
                id="imageUrl"
                className={inputClassName}
                value={form.imageUrl}
                onChange={(event) => updateField("imageUrl", event.target.value)}
                placeholder="https://..."
              />
            </FormField>
          </div>
        ) : null}

        {step === 1 ? (
          <FormField label="Conteúdo textual" id="content" required>
            <textarea
              id="content"
              className={`${inputClassName} min-h-[420px] resize-y leading-7`}
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
            />
          </FormField>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-6">
            <FormField label="Vídeo do YouTube" id="videoUrl" required>
              <input
                id="videoUrl"
                className={inputClassName}
                value={form.videoUrl}
                onChange={(event) => updateField("videoUrl", event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </FormField>
            <YouTubeEmbed url={form.videoUrl} title={form.title} />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            {form.quizQuestions.map((question, index) => {
              const questionValidation = validateQuizQuestion(question);

              return (
                <div key={index} className="rounded-[1.75rem] border border-aura-100 bg-aura-50/40 p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold text-ink-900">Pergunta {index + 1}</h3>
                    <Badge variant={questionValidation.valid ? "success" : "warning"}>
                      {questionValidation.valid ? "Completa" : "Incompleta"}
                    </Badge>
                  </div>
                  <div className="grid gap-4">
                    <FormField label="Enunciado" id={`question-${index}`} required>
                      <input
                        id={`question-${index}`}
                        className={inputClassName}
                        value={question.question}
                        onChange={(event) => updateQuestion(index, "question", event.target.value)}
                      />
                    </FormField>
                    <div className="grid gap-4 md:grid-cols-2">
                      {["A", "B", "C", "D"].map((letter) => (
                        <FormField key={letter} label={`Alternativa ${letter}`} id={`q-${index}-${letter}`} required>
                          <input
                            id={`q-${index}-${letter}`}
                            className={inputClassName}
                            value={question[`option${letter}`]}
                            onChange={(event) => updateQuestion(index, `option${letter}`, event.target.value)}
                          />
                        </FormField>
                      ))}
                    </div>
                    <FormField label="Resposta correta" id={`correct-${index}`} required>
                      <select
                        id={`correct-${index}`}
                        className={inputClassName}
                        value={question.correctAnswer}
                        onChange={(event) => updateQuestion(index, "correctAnswer", event.target.value)}
                      >
                        <option value="A">Alternativa A</option>
                        <option value="B">Alternativa B</option>
                        <option value="C">Alternativa C</option>
                        <option value="D">Alternativa D</option>
                      </select>
                    </FormField>
                  </div>
                </div>
              );
            })}
            <p className="text-sm font-medium text-ink-600">
              {validation.quizProgress} de {REQUIRED_QUIZ_QUESTION_COUNT} perguntas completas.
            </p>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-7">
            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-aura-100 bg-aura-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-ink-900">Status de publicação</h3>
                <p className="mt-1 text-sm text-ink-600">O módulo só aparece publicamente quando estiver publicado.</p>
              </div>
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-ink-800">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded accent-aura-700"
                  checked={form.published}
                  onChange={(event) => updateField("published", event.target.checked)}
                />
                Publicado
              </label>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-aura-100 bg-white">
              {form.imageUrl ? <img src={form.imageUrl} alt="" className="max-h-72 w-full object-cover" /> : null}
              <div className="p-6">
                <Badge>Preview</Badge>
                <h3 className="mt-4 text-3xl font-semibold text-ink-900">{form.title || "Título do módulo"}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-600">{form.description || "Descrição do módulo"}</p>
                <div className="content-body mt-6">{form.content || "Conteúdo textual"}</div>
              </div>
            </div>
            <YouTubeEmbed url={form.videoUrl} title={form.title} />
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-aura-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
            Voltar
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row">
            {step < STEPS.length - 1 ? (
              <Button disabled={!isStepValid(step)} onClick={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))}>
                Próximo
              </Button>
            ) : (
              <Button icon={Save} loading={saving} disabled={!validation.valid} onClick={handleSave}>
                {form.published ? "Publicar" : "Salvar"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
