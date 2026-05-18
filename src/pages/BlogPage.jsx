import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { toggleLike } from "../services/blogService";
import { useAuth } from "../hooks/useAuth";
import { useBlog } from "../hooks/useBlog";
import { useToast } from "../context/ToastContext";
import { BlogCard } from "../components/BlogCard";
import { EmptyState } from "../components/common/EmptyState";
import { CardSkeleton } from "../components/common/Skeleton";
import { PageHeader } from "../components/common/PageHeader";

export default function BlogPage() {
  const navigate = useNavigate();
  const { idToken, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { posts, isLoading, isRefreshing, mutate, refresh } = useBlog();
  const [likeLoadingId, setLikeLoadingId] = useState("");

  async function handleToggleLike(post) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const previousPosts = posts;
    const nextLiked = !post.likedByUser;

    setLikeLoadingId(post.id);
    mutate((current) =>
      current.map((item) =>
        item.id === post.id
          ? {
              ...item,
              likedByUser: nextLiked,
              likes: Math.max(0, Number(item.likes || 0) + (nextLiked ? 1 : -1)),
            }
          : item,
      ),
    );

    try {
      const response = await toggleLike(post.id, idToken);
      mutate((current) =>
        current.map((item) =>
          item.id === post.id
            ? { ...item, likes: response.likes, likedByUser: response.likedByUser }
            : item,
        ),
      );
    } catch (error) {
      mutate(previousPosts);
      showToast({
        type: "error",
        title: "Curtida não salva",
        message: error.message || "Tente novamente.",
      });
    } finally {
      setLikeLoadingId("");
      refresh();
    }
  }

  return (
    <main className="flex-1">
      <PageHeader
        eyebrow="Blog"
        title="Publicações"
        description="Textos publicados pela equipe administrativa aparecerão aqui em ordem recente."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {isRefreshing && !isLoading ? (
          <p className="mb-4 text-sm font-medium text-ink-600">Atualizando publicações...</p>
        ) : null}

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="Nenhum post disponível"
            description="Quando a equipe administrativa publicar o primeiro texto, ele será exibido nesta área."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                onToggleLike={handleToggleLike}
                likeLoading={likeLoadingId === post.id}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
