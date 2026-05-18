import { memo } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";
import { formatDate } from "../utils/formatters";

export const BlogCard = memo(function BlogCard({ post, onToggleLike, likeLoading = false }) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-aura-100 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-aura-200 hover:shadow-soft">
      {post.imageUrl ? (
        <Link to={`/blog/${post.id}`} className="block aspect-[16/9] overflow-hidden bg-aura-50">
          <img
            src={post.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
            loading="lazy"
          />
        </Link>
      ) : null}
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-aura-700">
          {formatDate(post.createdAt)}
        </p>
        <h2 className="mt-3 line-clamp-2 text-xl font-semibold text-ink-900">
          <Link to={`/blog/${post.id}`} className="transition hover:text-aura-800">
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-600">{post.excerpt || post.content}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-aura-100 pt-4">
          <button
            type="button"
            className={`focus-ring inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
              post.likedByUser
                ? "bg-blush-50 text-blush-500"
                : "bg-aura-50 text-ink-700 hover:bg-aura-100"
            }`}
            onClick={() => onToggleLike?.(post)}
            disabled={likeLoading}
            aria-pressed={Boolean(post.likedByUser)}
          >
            <Heart className={`h-4 w-4 ${post.likedByUser ? "fill-current" : ""}`} aria-hidden="true" />
            {Number(post.likes || 0)}
          </button>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-600">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {Number(post.commentCount || 0)}
          </span>
        </div>
      </div>
    </article>
  );
});
