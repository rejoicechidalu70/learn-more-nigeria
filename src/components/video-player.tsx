import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, VideoOff } from "lucide-react";
import { findVideoId } from "@/lib/video.functions";

export function queryFromLink(link: string) {
  try { return new URL(link).searchParams.get("search_query") ?? link; } catch { return link; }
}

export function VideoPlayer({ link, title }: { link: string; title: string }) {
  const fn = useServerFn(findVideoId);
  const q = queryFromLink(link);
  const { data, isLoading } = useQuery({ queryKey: ["video", q], queryFn: () => fn({ data: { q } }), staleTime: Infinity });
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
      {isLoading ? (
        <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
      ) : data?.id ? (
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${data.id}?rel=0&modestbranding=1&playsinline=1`}
          title={title}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground"><VideoOff /> Video not available right now.</div>
      )}
    </div>
  );
}
