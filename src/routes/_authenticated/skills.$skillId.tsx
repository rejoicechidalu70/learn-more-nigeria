import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Award, CheckCircle2, ChevronLeft, Circle, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { lessonCount, skillById, type Lesson } from "@/lib/data/skills";
import { useCertificates, useLessonProgress } from "@/lib/progress";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/skills/$skillId")({
  loader: ({ params }) => {
    const skill = skillById(params.skillId);
    if (!skill) throw notFound();
    return { name: skill.name, blurb: skill.blurb };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.name} — Free course | LEARN MORE` }, { name: "description", content: loaderData.blurb }, { property: "og:title", content: `${loaderData.name} — LEARN MORE` }, { property: "og:description", content: loaderData.blurb }]
      : [{ title: "Skill not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <div className="py-10 text-center">Skill not found. <Link to="/skills" className="text-primary">All skills</Link></div>,
  errorComponent: () => <div className="py-10 text-center">Couldn't load this skill.</div>,
  component: SkillPage,
});

function SkillPage() {
  const { skillId } = Route.useParams();
  const skill = skillById(skillId)!;
  const qc = useQueryClient();
  const { data: prog = [] } = useLessonProgress();
  const { data: certs = [] } = useCertificates();
  const done = new Set(prog.filter((p) => p.skill_id === skill.id).map((p) => p.lesson_id));
  const total = lessonCount(skill);
  const all = skill.modules.flatMap((m) => m.lessons);
  const [openId, setOpenId] = useState<string | null>(all.find((l) => !done.has(l.id))?.id ?? all[0].id);
  const hasCert = certs.some((c) => c.skill_id === skill.id);

  const complete = async (l: Lesson) => {
    const { error } = await supabase.from("lesson_progress").upsert({ skill_id: skill.id, lesson_id: l.id }, { onConflict: "user_id,lesson_id" });
    if (error) return toast.error("Couldn't save progress.");
    const nowDone = new Set(done).add(l.id);
    if (nowDone.size >= total && !hasCert) {
      await supabase.from("certificates").upsert({ skill_id: skill.id, skill_name: skill.name }, { onConflict: "user_id,skill_id" });
      toast.success("Course complete! Your certificate is ready 🎓");
      qc.invalidateQueries({ queryKey: ["certificates"] });
    } else toast.success("Lesson complete!");
    qc.invalidateQueries({ queryKey: ["lesson_progress"] });
    const next = all.find((x) => !nowDone.has(x.id));
    setOpenId(next?.id ?? null);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/skills" className="mb-3 inline-flex items-center text-sm font-semibold text-primary"><ChevronLeft className="size-4" /> All skills</Link>
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <div className="text-4xl">{skill.emoji}</div>
        <h1 className="mt-2 text-2xl font-extrabold">{skill.name}</h1>
        <p className="opacity-90">{skill.blurb}</p>
        <Progress value={(done.size / total) * 100} className="mt-4 h-2 bg-primary-foreground/30" />
        <p className="mt-1 text-sm opacity-90">{done.size} of {total} lessons</p>
      </div>
      {hasCert && (
        <Button asChild size="xl" className="mt-4 w-full bg-success text-success-foreground hover:bg-success/90">
          <Link to="/certificate/$skillId" params={{ skillId: skill.id }}><Award /> View your certificate</Link>
        </Button>
      )}
      {skill.modules.map((m) => (
        <div key={m.title} className="mt-5">
          <h2 className="mb-2 font-bold">{m.title}</h2>
          <div className="space-y-2">
            {m.lessons.map((l) => (
              <div key={l.id} className="rounded-xl border bg-card">
                <button onClick={() => setOpenId(openId === l.id ? null : l.id)} className="flex w-full items-center gap-3 p-4 text-left font-semibold">
                  {done.has(l.id) ? <CheckCircle2 className="text-success" /> : <Circle className="text-muted-foreground" />} {l.title}
                </button>
                {openId === l.id && <LessonBody lesson={l} done={done.has(l.id)} onComplete={() => complete(l)} />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LessonBody({ lesson, done, onComplete }: { lesson: Lesson; done: boolean; onComplete: () => void }) {
  const [pick, setPick] = useState<number | null>(null);
  const correct = pick === lesson.quiz.answer;
  return (
    <div className="space-y-3 border-t p-4">
      <a href={lesson.video} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-muted p-3 text-sm font-semibold">
        <PlayCircle className="size-8 text-primary" /> Watch video lesson <span className="ml-auto text-xs font-normal text-muted-foreground">uses data</span>
      </a>
      <p>{lesson.text}</p>
      <div className="rounded-xl border p-3">
        <p className="mb-2 text-sm font-bold">Quick quiz: {lesson.quiz.q}</p>
        <div className="grid gap-2">
          {lesson.quiz.options.map((o, i) => (
            <button key={i} onClick={() => setPick(i)} className={`rounded-lg border-2 p-2.5 text-left text-sm font-medium ${pick === i ? (correct ? "border-success bg-success-soft" : "border-destructive bg-destructive/10") : ""}`}>{o}</button>
          ))}
        </div>
        {pick !== null && <p className="mt-2 text-sm font-semibold">{correct ? "Correct! ✅" : "Not quite — try again."}</p>}
      </div>
      {!done && <Button size="lg" className="w-full" disabled={!correct} onClick={onComplete}>Mark lesson complete</Button>}
    </div>
  );
}
