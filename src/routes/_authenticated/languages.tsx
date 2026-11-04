import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, ChevronLeft, Languages as LanguagesIcon, Play, Square } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { LANGUAGES, getLanguage, type LangLesson, type LanguageCourse } from "@/lib/data/languages";
import { speak, speechSupported, stopSpeaking } from "@/lib/speak";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/languages")({
  head: () => ({
    meta: [
      { title: "Language learning — LEARN MORE" },
      { name: "description", content: "Learn Igbo, Yoruba, Hausa, Pidgin, French, Spanish, Chinese, Korean and more — with words read aloud." },
      { property: "og:title", content: "Language learning — LEARN MORE" },
      { property: "og:description", content: "Nigerian and world languages, one tap to hear every word." },
    ],
  }),
  component: LanguagesPage,
});

function LanguagesPage() {
  const [langId, setLangId] = useState<string | null>(null);
  const lang = langId ? getLanguage(langId) : undefined;

  useEffect(() => () => stopSpeaking(), []);

  if (lang) return <LanguageDetail lang={lang} onBack={() => { stopSpeaking(); setLangId(null); }} />;
  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/" className="mb-3 inline-flex items-center text-sm font-semibold text-primary"><ChevronLeft className="size-4" /> Home</Link>
      <PageTitle icon={LanguagesIcon} title="Language learning" sub={`${LANGUAGES.length} languages · hear every word spoken aloud`} />
      <div className="grid gap-3 sm:grid-cols-2">
        {LANGUAGES.map((l) => (
          <button key={l.id} onClick={() => setLangId(l.id)} className="flex items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-colors hover:border-primary">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><LanguagesIcon className="size-5" /></div>
            <div className="min-w-0">
              <p className="font-bold">{l.name}</p>
              <p className="truncate text-xs font-semibold text-muted-foreground">{l.native} · {l.where}</p>
              <p className="mt-1 text-xs text-muted-foreground">{l.lessons.length} lessons</p>
            </div>
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Ten minutes a day — one lesson at a time. Say every word out loud.</p>
    </div>
  );
}

function LanguageDetail({ lang, onBack }: { lang: LanguageCourse; onBack: () => void }) {
  const [open, setOpen] = useState<LangLesson | null>(null);
  if (open) return <LessonDetail lang={lang} lesson={open} onBack={() => { stopSpeaking(); setOpen(null); }} />;
  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"><ChevronLeft className="size-4" /> All languages</button>
      <PageTitle icon={LanguagesIcon} title={lang.name} sub={`${lang.native} · ${lang.where}`} />
      <p className="mb-4 rounded-2xl border bg-card p-4 text-sm leading-relaxed text-muted-foreground">{lang.about}</p>
      <div className="space-y-2">
        {lang.lessons.map((ls, i) => (
          <button key={ls.id} onClick={() => setOpen(ls)} className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-colors hover:border-primary">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-soft text-success font-extrabold">{i + 1}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{ls.title}</p>
              <p className="text-xs text-muted-foreground">{ls.items.length} words & phrases</p>
            </div>
            <BookOpen className="size-5 shrink-0 text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
}

function LessonDetail({ lang, lesson, onBack }: { lang: LanguageCourse; lesson: LangLesson; onBack: () => void }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const say = (id: string, text: string) => {
    if (playingId === id) {
      stopSpeaking();
      setPlayingId(null);
      return;
    }
    if (!speechSupported()) return toast.error("This phone can't speak aloud — practise by reading.");
    const ok = speak(text, () => setPlayingId((p) => (p === id ? null : p)), lang.langCode);
    if (!ok) return toast.error("This phone can't speak aloud — practise by reading.");
    setPlayingId(id);
  };
  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"><ChevronLeft className="size-4" /> {lang.name} lessons</button>
      <PageTitle icon={LanguagesIcon} title={lesson.title} sub={lang.name} />
      <p className="mb-4 rounded-2xl border bg-card p-4 text-sm leading-relaxed text-muted-foreground">{lesson.intro}</p>
      <div className="space-y-2">
        {lesson.items.map((it) => (
          <div key={it.term} className={`flex items-center gap-3 rounded-2xl border bg-card p-3 ${playingId === it.term ? "border-primary" : ""}`}>
            <button onClick={() => say(it.term, it.term)} aria-label={`Hear ${it.term}`} className="grid size-10 shrink-0 place-items-center rounded-full bg-success-soft text-success">
              {playingId === it.term ? <Square className="size-4" /> : <Play className="size-5" />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{it.term}</p>
              <p className="text-sm text-muted-foreground">{it.meaning}</p>
              {it.note && <p className="mt-0.5 text-xs text-muted-foreground">{it.note}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border-2 border-success/40 bg-success-soft p-4">
        <p className="font-bold text-success">Today's practice</p>
        <p className="mt-1 text-sm">{lesson.practice}</p>
        <button onClick={() => say("practice", lesson.practice)} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-success">
          <Play className="size-4" /> Hear it read
        </button>
      </div>
    </div>
  );
}

// keep import used when building for older browsers
declare const useEffect: typeof import("react").useEffect;
