import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Send } from "lucide-react";
import { COMMENT_PAGE_SIZE } from "../utils/constants";
import { formatDateTime } from "../utils/formatters";
import { addComment, getComments } from "../services/blogService";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { Button } from "./common/Button";
import { EmptyState } from "./common/EmptyState";

export function CommentSection({ postId }) {
  const { isAuthenticated, idToken } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");

  const canLoadMore = useMemo(() => nextOffset !== null && comments.length < total, [comments.length, nextOffset, total]);

  const loadComments = useCallback(
    async (offset = 0) => {
      setIsLoading(true);
      try {
        const response = await getComments(postId, { offset, limit: COMMENT_PAGE_SIZE });
        setComments((current) => {
          const merged = offset === 0 ? response.items || [] : [...current, ...(response.items || [])];
          const unique = new Map(merged.map((item) => [item.id, item]));
          return Array.from(unique.values());
        });
        setNextOffset(response.nextOffset ?? null);
        setTotal(Number(response.total || 0));
      } catch {
        showToast({
          type: "error",
          title: "Comentários indisponíveis",
          message: "Não foi possível carregar os comentários agora.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [postId, showToast],
  );

  useEffect(() => {
    loadComments(0);
  }, [loadComments]);

  async function handleSubmit(event) {
    event.preventDefault();
    const text = comment.trim();
    if (!text || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      const createdComment = await addComment(postId, text, idToken);
      setComments((current) => [createdComment, ...current]);
      setTotal((current) => current + 1);
      setComment("");
      showToast({ type: "success", title: "Comentário publicado" });
    } catch (error) {
      showToast({
        type: "error",
        title: "Comentário não enviado",
        message: error.message || "Revise sua conexão e tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-12 rounded-[2rem] border border-aura-100 bg-white p-5 shadow-card sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink-900">Comentários</h2>
          <p className="mt-1 text-sm text-ink-600">{total} publicados</p>
        </div>
      </div>

      {isAuthenticated ? (
        <form className="mt-6" onSubmit={handleSubmit}>
          <label htmlFor="comment" className="sr-only">
            Escrever comentário
          </label>
          <textarea
            id="comment"
            className="focus-ring min-h-28 w-full resize-y rounded-3xl border border-aura-100 bg-aura-50/50 px-4 py-3 text-sm leading-6 text-ink-900 placeholder:text-ink-600/45"
            placeholder="Escreva seu comentário"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={800}
          />
          <div className="mt-3 flex justify-end">
            <Button type="submit" icon={Send} loading={isSubmitting} disabled={!comment.trim()}>
              Publicar
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-3xl bg-aura-50 p-5 text-sm text-ink-700">
          <Link className="font-semibold text-aura-800 transition hover:text-aura-600" to="/login">
            Entre com Google
          </Link>{" "}
          para comentar.
        </div>
      )}

      <div className="mt-7 space-y-4">
        {!isLoading && comments.length === 0 ? (
          <EmptyState
            compact
            icon={MessageCircle}
            title="Nenhum comentário ainda"
            description="Os comentários publicados aparecerão aqui com paginação automática."
          />
        ) : null}

        {comments.map((item) => (
          <article key={item.id} className="rounded-3xl border border-aura-100 bg-white p-4">
            <div className="flex gap-3">
              {item.userPhoto ? (
                <img
                  src={item.userPhoto}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-aura-100 text-sm font-bold text-aura-800">
                  {(item.userName || "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="font-semibold text-ink-900">{item.userName}</h3>
                  <span className="text-xs font-medium text-ink-600">{formatDateTime(item.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-700">{item.comment}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {canLoadMore ? (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={() => loadComments(nextOffset)} loading={isLoading}>
            Carregar mais
          </Button>
        </div>
      ) : null}
    </section>
  );
}
