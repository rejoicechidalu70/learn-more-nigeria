import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Play, Square } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { AFFIRMATIONS, AFFIRMATION_CATEGORIES, type Affirmation } from "@/lib/data/affirmations";
import { speak, speechSupported, stopSpeaking } from "@/lib/speak";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/affirmations")({
  head: () => ({
    meta: [
      { title: "Affirmation voice notes — LEARN MORE" },
      { name: "description", content: "Daily affirmation voice notes for exam success and personal goals." },
      { property: "og:title", content: "Affirmation voice notes — LEARN MORE" },
      { property: "og:description", content: "Say it out loud every day: I will pass my exams." },
    ],
  }),
  component: Affirmations,
});

const CATS = ["All", ...AFFIRMATION_CATEGORIES] as const;

function Affirmations() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => () => stopSpeaking(), []);

  const play = (a: Affirmation) => {
    if (playingId === a.id) {
      stopSpeaking();
      setPlayingId(null);
      return;
    }
    if (a.audioUrl) {
      new Audio(a.audioUrl).play().catch(() => toast.error("Couldn't play the voice note."));
      setPlayingId(a.id);
      return;
    }
    if (!speechSupported()) {
      toast.error("This phone can't play voice notes — read it aloud yourself!");
      return;
    }
    const ok = speak(a.text, () => setPlayingId((p) => (p === a.id ? null : p)));
    if (!ok) return toast.error("This phone can't play voice notes — read it aloud yourself!");
    setPlayingId(a.id);
  };

  const list = AFFIRMATIONS.filter((a) => cat === "All" || a.category === cat);

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/" className="mb-3 inline-flex items-center text-sm font-semibold text-primary"><ChevronLeft className="size-4" /> Home</Link>
      <PageTitle title="Affirmation voice notes" sub="Say it out loud every morning — one tap to play." />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {CATS.map((c) => (
          <button key={c} onClick={() => { setCat(c); stopSpeaking(); setPlayingId(null); }} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${cat === c ? "border-primary bg-primary-soft text-primary" : "bg-card"}`}>{c}</button>
        ))}
      </div>
      <div className="space-y-2">
        {list.map((a) => (
          <div key={a.id} className={`rounded-2xl border bg-card p-4 ${playingId === a.id ? "border-primary" : ""}`}>
            <div className="flex items-center gap-3">
              <button onClick={() => play(a)} aria-label={playingId === a.id ? "Stop voice note" : "Play voice note"} className={`grid size-12 shrink-0 place-items-center rounded-full ${playingId === a.id ? "bg-primary text-primary-foreground" : "bg-success-soft text-success"}`}>
                {playingId === a.id ? <Square className="size-5" /> : <Play className="size-6" />}
              </button>
              <div className="min-w-0">
                <p className="font-bold">{a.title}</p>
                <p className="text-xs font-semibold text-muted-foreground">{a.category} · voice note</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.text}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Tip: play one every morning before you study. Say the words out loud with it.</p>
    </div>
  );
}
