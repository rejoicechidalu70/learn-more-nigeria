import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, CheckCircle2, ExternalLink, FileText, Radio, Video } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { CLASSES, classTime, icsFor, type ClassItem } from "@/lib/data/classes";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/classes")({
  head: () => ({
    meta: [
      { title: "Online Classes & Catch-Up — LEARN MORE" },
      { name: "description", content: "Join live classes or catch up on recordings with notes and transcripts." },
      { property: "og:title", content: "Online Classes & Catch-Up — LEARN MORE" },
      { property: "og:description", content: "Live and recorded classes with transcripts, for students who missed class." },
    ],
  }),
  component: ClassesPage,
});

export function useAttendance() {
  return useQuery({
    queryKey: ["attendance"],
    queryFn: async () => (await supabase.from("class_attendance").select("class_id")).data ?? [],
  });
}

function download(c: ClassItem) {
  const blob = new Blob([icsFor(c)], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${c.id}.ics`;
  a.click();
}

function ClassesPage() {
  const [tab, setTab] = useState<"upcoming" | "recorded">("upcoming");
  const qc = useQueryClient();
  const { data: att = [] } = useAttendance();
  const seen = new Set(att.map((a) => a.class_id));
  const withTime = CLASSES.map((c) => ({ c, ...classTime(c) }));
  const upcoming = withTime.filter((x) => x.status !== "past").sort((a, b) => +a.start - +b.start);
  const past = withTime.filter((x) => x.status === "past").sort((a, b) => +b.start - +a.start);

  const mark = async (id: string) => {
    await supabase.from("class_attendance").upsert({ class_id: id, status: "watched" }, { onConflict: "user_id,class_id" });
    qc.invalidateQueries({ queryKey: ["attendance"] });
  };
  const join = (c: ClassItem) => { mark(c.id); window.open(c.link, "_blank", "noopener"); };

  return (
    <div>
      <PageTitle title="Classes" sub="Join live, or catch up on anything you missed." icon={Video} />
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        {(["upcoming", "recorded"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg py-2.5 text-sm font-bold capitalize ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
            {t === "upcoming" ? "Live & upcoming" : `Recordings (${past.filter((p) => !seen.has(p.c.id)).length} missed)`}
          </button>
        ))}
      </div>

      {tab === "upcoming" ? (
        <div className="space-y-3">
          {upcoming.map(({ c, start, status }) => (
            <div key={c.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">{c.level} · {c.subject}</p>
                  <p className="text-lg font-bold">{c.title}</p>
                  <p className="text-sm text-muted-foreground">{c.teacher} · {start.toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })} · {c.durationMin} min</p>
                </div>
                {status === "live" && <span className="flex items-center gap-1 rounded-full bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground"><Radio className="size-3" /> LIVE</span>}
              </div>
              <p className="mt-2 text-sm">{c.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {status === "live" ? <Button size="lg" onClick={() => join(c)}>Join class <ExternalLink /></Button> : <Button size="lg" variant="outline" onClick={() => download(c)}><Bell /> Remind me</Button>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {past.map(({ c, start }) => <Recording key={c.id} c={c} start={start} watched={seen.has(c.id)} onWatch={() => join(c)} onMark={() => mark(c.id)} />)}
        </div>
      )}
    </div>
  );
}

function Recording({ c, start, watched, onWatch, onMark }: { c: ClassItem; start: Date; watched: boolean; onWatch: () => void; onMark: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border bg-card p-4 ${watched ? "" : "border-l-4 border-l-warning"}`}>
      <p className="text-xs font-bold uppercase text-muted-foreground">{c.level} · {c.subject} · {start.toLocaleDateString()}</p>
      <p className="text-lg font-bold">{c.title}</p>
      <p className="text-sm text-muted-foreground">{c.teacher} · {watched ? "Watched ✓" : "Missed — catch up"}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={onWatch}><Video /> Watch recording</Button>
        <Button variant="outline" onClick={() => setOpen(!open)}><FileText /> {open ? "Hide" : "Notes & transcript"}</Button>
        {!watched && <Button variant="ghost" onClick={onMark}><CheckCircle2 /> Mark caught up</Button>}
      </div>
      {open && (
        <div className="mt-3 rounded-xl bg-muted p-3 text-sm">
          <p className="font-bold">Summary</p><p>{c.summary}</p>
          <p className="mt-2 font-bold">Transcript</p>
          <ul className="list-disc space-y-1 pl-5">{c.transcript.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
