import { VideoOff } from "lucide-react";
import { getYouTubeEmbedUrl } from "../utils/youtube";

export function YouTubeEmbed({ url, title }) {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[2rem] border border-aura-100 bg-white text-center text-ink-600 shadow-card">
        <div>
          <VideoOff className="mx-auto h-8 w-8 text-aura-600" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold">Vídeo indisponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-aura-100 bg-ink-900 shadow-soft">
      <iframe
        className="aspect-video w-full"
        src={embedUrl}
        title={title || "Vídeo do módulo"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
