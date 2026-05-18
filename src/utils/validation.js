import { REQUIRED_QUIZ_QUESTION_COUNT } from "./constants";
import { isValidYouTubeUrl } from "./youtube";

export function isFilled(value) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

export function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function createEmptyQuestion() {
  return {
    id: "",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  };
}

export function createEmptyQuiz() {
  return Array.from({ length: REQUIRED_QUIZ_QUESTION_COUNT }, createEmptyQuestion);
}

export function validateQuizQuestion(question) {
  const requiredFields = ["question", "optionA", "optionB", "optionC", "optionD"];
  const missing = requiredFields.filter((field) => !isFilled(question?.[field]));
  const validAnswer = ["A", "B", "C", "D"].includes(question?.correctAnswer);

  return {
    valid: missing.length === 0 && validAnswer,
    missing,
    validAnswer,
  };
}

export function validateQuiz(quizQuestions = []) {
  const questions = Array.isArray(quizQuestions) ? quizQuestions : [];
  const completeQuestions = questions.filter((question) => validateQuizQuestion(question).valid);

  return {
    valid:
      questions.length === REQUIRED_QUIZ_QUESTION_COUNT &&
      completeQuestions.length === REQUIRED_QUIZ_QUESTION_COUNT,
    completeQuestions: completeQuestions.length,
  };
}

export function validateModuleForm(module) {
  const quiz = validateQuiz(module?.quizQuestions);

  return {
    title: isFilled(module?.title),
    description: isFilled(module?.description),
    imageUrl: isFilled(module?.imageUrl),
    content: isFilled(module?.content),
    videoUrl: isValidYouTubeUrl(module?.videoUrl),
    quiz: quiz.valid,
    quizProgress: quiz.completeQuestions,
    valid:
      isFilled(module?.title) &&
      isFilled(module?.description) &&
      isFilled(module?.imageUrl) &&
      isFilled(module?.content) &&
      isValidYouTubeUrl(module?.videoUrl) &&
      quiz.valid,
  };
}

export function validatePostForm(post) {
  return {
    title: isFilled(post?.title),
    content: isFilled(post?.content),
    valid: isFilled(post?.title) && isFilled(post?.content),
  };
}

export function normalizeModulePayload(module) {
  return {
    id: module.id || "",
    title: normalizeString(module.title),
    description: normalizeString(module.description),
    imageUrl: normalizeString(module.imageUrl),
    content: normalizeString(module.content),
    videoUrl: normalizeString(module.videoUrl),
    published: Boolean(module.published),
    quizQuestions: (module.quizQuestions || []).map((question) => ({
      id: question.id || "",
      question: normalizeString(question.question),
      optionA: normalizeString(question.optionA),
      optionB: normalizeString(question.optionB),
      optionC: normalizeString(question.optionC),
      optionD: normalizeString(question.optionD),
      correctAnswer: question.correctAnswer || "A",
    })),
  };
}
