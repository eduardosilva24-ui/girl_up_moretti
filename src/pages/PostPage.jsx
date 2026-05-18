import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, Newspaper } from "lucide-react";
import { getPost, toggleLike } from "../services/blogService";
import { formatDate } from "../utils/formatters";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import { CommentSection } from "../components/CommentSection";

export default function PostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { idToken, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getPost(postId, { idToken, signal: controller.signal })
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [idToken, postId]);

  async function handleToggleLike() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const previousPost = post;
    const nextLiked = !post.likedByUser;
    setPost((current) => ({
      ...current,
      likedByUser: nextLiked,
      likes: Math.max(0, Number(current.likes || 0) + (nextLiked ? 1 : -1)),
    }));
    setLikeLoading(true);

    try {
      const response = await toggleLike(post.id, idToken);
      setPost((current) => ({
        ...current,
        likes: response.likes,
        likedByUser: response.likedByUser,
      }));
    } catch (error) {
      setPost(previousPost);
      showToast({
        type: "error",
        title: "Curtida não salva",
        message: error.message || "Tente novamente.",
      });
    } finally {
      setLikeLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="mt-8 h-96 w-full" />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="mx-auto max-w-4xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={Newspaper}
          title="Post não encontrado"
          description="A publicação pode ter sido removida, despublicada ou ainda não estar disponível."
          action={
            <Button as={Link} to="/blog" variant="secondary">
              Voltar para o blog
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-aura-700">
            {formatDate(post.createdAt)}
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-ink-900 sm:text-5xl">{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              variant={post.likedByUser ? "subtle" : "secondary"}
              icon={Heart}
              onClick={handleToggleLike}
              loading={likeLoading}
            >
              {Number(post.likes || 0)} curtidas
            </Button>
            <Button as={Link} to="/blog" variant="ghost">
              Voltar
            </Button>
          </div>
        </header>

        {post.imageUrl ? (
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-aura-100 bg-aura-50 shadow-soft">
            <img src={post.imageUrl} alt="" className="max-h-[520px] w-full object-cover" />
          </div>
        ) : null}

        <div className="content-body mt-8 rounded-[2rem] border border-aura-100 bg-white p-6 shadow-card sm:p-8">
          {post.content}
        </div>

        <CommentSection postId={post.id} />
      </article>
    </main>
  );
}
