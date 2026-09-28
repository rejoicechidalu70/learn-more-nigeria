import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Bookmark, BookmarkCheck, Check, ChevronLeft, ChevronRight, Clock, MessageCircle, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { byId, filterQuestions, type Question } from "@/lib/data/questions";
import { supabase } from "@/integrations/supabase/client";
import { createThread } from "@/lib/tutor-store";

const search = z.object({
  exam: z.string().optional(),
  subject: z.string().optional(),
  year: z.number().optional(),
  mode: z.enum(["practice", "exam"]).default("practice"),
  ids: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/practice/session")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "CBT Session — LEARN MORE" }, { name: "description", content: "Answer past questions and see your score." }, { property: "og:title", content: "CBT Session — LEARN MORE" }, { property: "og:description", content: "Answer past questions and see your score." }] }),
  component: Session,
});

const LETTERS = ["A", "B", "C", "D"];

function useBookmarks() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => (await supabase.from("bookmarks").select("question_id")).data ?? [],
  });
  const set = new Set(data.map((b) => b.question_id));
  const toggle = async (id: string) => {
    if (set.has(id)) await supabase.from("bookmarks").delete().eq("question_id", id);
    else await supabase.from("bookmarks").insert({ question_id: id });
    qc.invalidateQueries({ queryKey: ["bookmarks"] });
  };
  return { has: (id: string) => set.has(id), toggle };
}

function useExplain() {
  const navigate = useNavigate();
  return (q: Question, picked?: number) => {
    const t = createThread({
      title: `Explain: ${q.question.slice(0, 40)}`,
      subject: q.subject,
      pending: `Please explain this ${q.subject} past question step by step.\n\nQuestion: ${q.question}\nOptions: ${q.options.map((o, i) => `${LETTERS[i]}. ${o}`).join("  ")}\nCorrect answer: ${LETTERS[q.answer]}. ${q.options[q.answer]}${picked !== undefined && picked !== q.answer ? `\nI chose ${LETTERS[picked]}. Why is that wrong?` : ""}`,
    });
    navigate({ to: "/tutor/$threadId", params: { threadId: t.id } });
  };
}

function Session() {
  const s = Route.useSearch();
  const questions = useMemo(() => {
    if (s.ids) return s.ids.split(",").map(byId).filter(Boolean) as Question[];
    return filterQuestions({ exam: s.exam, subject: s.subject, year: s.year });
  }, [s.ids, s.exam, s.subject, s.year]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(questions.length * 60);
  const bm = useBookmarks();
  const explain = useExplain();
  const isExam = s.mode === "exam";

  useEffect(() => {
    if (!isExam || done) return;
    const t = setInterval(() => setSecondsLeft((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, [isExam, done]);
  useEffect(() => {
    if (isExam && secondsLeft <= 0 && !done) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const finish = async () => {
    setDone(true);
    const breakdown: Record<string, { correct: number; total: number }> = {};
    const wrong: string[] = [];
    let score = 0;
    for (const q of questions) {
      const b = (breakdown[q.topic] ??= { correct: 0, total: 0 });
      b.total++;
      if (answers[q.id] === q.answer) { b.correct++; score++; } else wrong.push(q.id);
    }
    const { error } = await supabase.from("cbt_attempts").insert({
      exam: s.exam ?? "Mixed", subject: s.subject ?? "Bookmarks", year: s.year ?? null, mode: s.mode,
      score, total: questions.length, topic_breakdown: breakdown, wrong_ids: wrong,
    });
    if (error) toast.error("Couldn't save your score. Check your connection.");
  };

  if (!questions.length) return <div className="py-10 text-center">No questions found. <Link to="/practice" className="text-primary">Go back</Link></div>;
  if (done) return <Results questions={questions} answers={answers} mode={s.mode} bm={bm} explain={explain} />;

  const q = questions[idx];
  const picked = answers[q.id];
  const revealed = !isExam && picked !== undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-muted-foreground">{s.exam ?? "Bookmarks"} · {q.subject} · {q.year}</div>
        {isExam && (
          <div className={`flex items-center gap-1 rounded-full px-3 py-1 font-mono text-sm font-bold ${secondsLeft < 60 ? "bg-destructive text-destructive-foreground" : "bg-primary-soft text-primary"}`}>
            <Clock className="size-4" /> {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
          </div>
        )}
      </div>
      <Progress value={((idx + 1) / questions.length) * 100} className="mb-4 h-2" />

      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="text-xs font-bold uppercase text-muted-foreground">Question {idx + 1} of {questions.length} · {q.topic}</p>
          <button onClick={() => bm.toggle(q.id)} aria-label="Bookmark question" className="text-primary">{bm.has(q.id) ? <BookmarkCheck /> : <Bookmark />}</button>
        </div>
        <p className="text-lg font-semibold">{q.question}</p>
        <div className="mt-4 space-y-2">
          {q.options.map((o, i) => {
            const isPicked = picked === i;
            let tone = isPicked ? "border-primary bg-primary-soft" : "bg-background";
            if (revealed && i === q.answer) tone = "border-success bg-success-soft";
            else if (revealed && isPicked) tone = "border-destructive bg-destructive/10";
            return (
              <button key={i} disabled={revealed} onClick={() => setAnswers({ ...answers, [q.id]: i })} className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left font-medium ${tone}`}>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-sm font-bold">{LETTERS[i]}</span>
                {o}
                {revealed && i === q.answer && <Check className="ml-auto text-success" />}
                {revealed && isPicked && i !== q.answer && <X className="ml-auto text-destructive" />}
              </button>
            );
          })}
        </div>
        {revealed && (
          <div className="mt-4 rounded-xl bg-muted p-4">
            <p className="font-bold">{picked === q.answer ? "Correct! 🎉" : `Answer: ${LETTERS[q.answer]}`}</p>
            <p className="mt-1 text-sm">{q.explanation}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => explain(q, picked)}><MessageCircle /> Explain this answer (AI)</Button>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="xl" disabled={idx === 0} onClick={() => setIdx(idx - 1)}><ChevronLeft /> Prev</Button>
        {idx < questions.length - 1 ? (
          <Button size="xl" className="flex-1" onClick={() => setIdx(idx + 1)}>Next <ChevronRight /></Button>
        ) : (
          <Button size="xl" className="flex-1 bg-success text-success-foreground hover:bg-success/90" onClick={finish}>Submit</Button>
        )}
      </div>

      {isExam && (
        <div className="mt-5 rounded-2xl border bg-card p-4">
          <p className="mb-2 text-sm font-bold">Question palette</p>
          <div className="grid grid-cols-8 gap-2 sm:grid-cols-10">
            {questions.map((x, i) => (
              <button key={x.id} onClick={() => setIdx(i)} className={`h-10 rounded-lg text-sm font-bold ${i === idx ? "ring-2 ring-primary" : ""} ${answers[x.id] !== undefined ? "bg-success text-success-foreground" : "bg-muted"}`}>{i + 1}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Results({ questions, answers, mode, bm, explain }: { questions: Question[]; answers: Record<string, number>; mode: string; bm: ReturnType<typeof useBookmarks>; explain: ReturnType<typeof useExplain> }) {
  const score = questions.filter((q) => answers[q.id] === q.answer).length;
  const pct = Math.round((score / questions.length) * 100);
  const wrong = questions.filter((q) => answers[q.id] !== q.answer);
  const topics: Record<string, { c: number; t: number }> = {};
  for (const q of questions) { const x = (topics[q.topic] ??= { c: 0, t: 0 }); x.t++; if (answers[q.id] === q.answer) x.c++; }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-3xl bg-primary p-6 text-center text-primary-foreground">
        <p className="text-sm font-semibold opacity-90">Your score</p>
        <p className="text-6xl font-extrabold">{pct}%</p>
        <p className="opacity-90">{score} of {questions.length} correct</p>
        {mode === "exam" && <p className="mt-1 text-sm opacity-90">JAMB scale: about {Math.round(pct * 4)}/400 if repeated across 4 subjects</p>}
      </div>
      <div className="rounded-2xl border bg-card p-4">
        <p className="mb-3 font-bold">Breakdown by topic</p>
        <div className="space-y-3">
          {Object.entries(topics).map(([t, v]) => (
            <div key={t}>
              <div className="mb-1 flex justify-between text-sm"><span>{t}</span><span className="font-semibold">{v.c}/{v.t}</span></div>
              <Progress value={(v.c / v.t) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {wrong.length > 0 && (
          <Button asChild size="xl"><Link to="/practice/session" search={{ mode: "practice", ids: wrong.map((q) => q.id).join(",") }} reloadDocument><RotateCcw /> Retry wrong answers ({wrong.length})</Link></Button>
        )}
        <Button asChild size="xl" variant="outline"><Link to="/practice">New practice</Link></Button>
      </div>
      <div className="space-y-3">
        <p className="font-bold">Review</p>
        {questions.map((q, i) => {
          const ok = answers[q.id] === q.answer;
          return (
            <div key={q.id} className={`rounded-2xl border-l-4 bg-card p-4 ${ok ? "border-l-success" : "border-l-destructive"}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{i + 1}. {q.question}</p>
                <button onClick={() => bm.toggle(q.id)} className="text-primary" aria-label="Bookmark">{bm.has(q.id) ? <BookmarkCheck /> : <Bookmark />}</button>
              </div>
              <p className="mt-1 text-sm">Correct: <b>{LETTERS[q.answer]}. {q.options[q.answer]}</b>{!ok && <> · You: {answers[q.id] !== undefined ? `${LETTERS[answers[q.id]]}. ${q.options[answers[q.id]]}` : "No answer"}</>}</p>
              <p className="mt-1 text-sm text-muted-foreground">{q.explanation}</p>
              <Button variant="ghost" size="sm" className="mt-2 px-0 text-primary" onClick={() => explain(q, answers[q.id])}><MessageCircle /> Explain this answer</Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
