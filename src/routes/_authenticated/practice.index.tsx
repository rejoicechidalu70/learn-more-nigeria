import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bookmark, Clock, Lightbulb, PenLine } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { EXAMS, SUBJECTS, YEARS, filterQuestions } from "@/lib/data/questions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/practice/")({
  head: () => ({
    meta: [
      { title: "Past Questions & CBT Practice — LEARN MORE" },
      { name: "description", content: "Practise JAMB, WAEC and NECO past questions by subject and year, with explanations or a timed CBT." },
      { property: "og:title", content: "Past Questions & CBT Practice — LEARN MORE" },
      { property: "og:description", content: "JAMB, WAEC and NECO practice with instant explanations and timed exam mode." },
    ],
  }),
  component: PracticeHome,
});

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-4 py-2 text-sm font-semibold ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{children}</button>
  );
}

function PracticeHome() {
  const [exam, setExam] = useState<string>("JAMB");
  const [subject, setSubject] = useState<string>("Mathematics");
  const [year, setYear] = useState<number | undefined>(undefined);
  const count = filterQuestions({ exam, subject, year }).length;

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => (await supabase.from("bookmarks").select("question_id")).data ?? [],
  });

  return (
    <div>
      <PageTitle title="Past Questions & CBT" sub="Choose your exam, subject and year." icon={PenLine} />
      <div className="space-y-5 rounded-2xl border bg-card p-4">
        <div><p className="mb-2 text-sm font-bold">Exam</p><div className="flex flex-wrap gap-2">{EXAMS.map((e) => <Chip key={e} active={exam === e} onClick={() => setExam(e)}>{e === "JAMB" ? "JAMB (UTME)" : e}</Chip>)}</div></div>
        <div><p className="mb-2 text-sm font-bold">Subject</p><div className="flex flex-wrap gap-2">{SUBJECTS.map((s) => <Chip key={s} active={subject === s} onClick={() => setSubject(s)}>{s}</Chip>)}</div></div>
        <div><p className="mb-2 text-sm font-bold">Year</p><div className="flex flex-wrap gap-2"><Chip active={!year} onClick={() => setYear(undefined)}>All years</Chip>{YEARS.map((y) => <Chip key={y} active={year === y} onClick={() => setYear(y)}>{y}</Chip>)}</div></div>
        <p className="text-sm text-muted-foreground">{count} question{count === 1 ? "" : "s"} available</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild size="xl" disabled={!count} className="h-auto flex-col items-start gap-1 py-4 text-left">
            <Link to="/practice/session" search={{ exam, subject, year, mode: "practice" }}>
              <span className="flex items-center gap-2"><Lightbulb /> Practice mode</span>
              <span className="text-xs font-normal opacity-90">Instant answers & explanations</span>
            </Link>
          </Button>
          <Button asChild size="xl" disabled={!count} className="h-auto flex-col items-start gap-1 bg-success py-4 text-left text-success-foreground hover:bg-success/90">
            <Link to="/practice/session" search={{ exam, subject, year, mode: "exam" }}>
              <span className="flex items-center gap-2"><Clock /> Exam mode (CBT)</span>
              <span className="text-xs font-normal opacity-90">Timed, JAMB-style. Results at the end</span>
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-3"><Bookmark className="text-primary" /><div><p className="font-bold">Bookmarked questions</p><p className="text-sm text-muted-foreground">{bookmarks.length} saved</p></div></div>
        <Button asChild variant="outline" disabled={!bookmarks.length}>
          <Link to="/practice/session" search={{ mode: "practice", ids: bookmarks.map((b) => b.question_id).join(",") }}>Practise them</Link>
        </Button>
      </div>
    </div>
  );
}
