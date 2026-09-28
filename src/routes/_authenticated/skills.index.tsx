import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { Progress } from "@/components/ui/progress";
import { SKILLS, lessonCount } from "@/lib/data/skills";
import { useLessonProgress } from "@/lib/progress";

export const Route = createFileRoute("/_authenticated/skills/")({
  head: () => ({
    meta: [
      { title: "Free Skills Academy — LEARN MORE" },
      { name: "description", content: "Free tech and vocational skills training with lessons, quizzes and completion certificates." },
      { property: "og:title", content: "Free Skills Academy — LEARN MORE" },
      { property: "og:description", content: "Web dev, cybersecurity, AI, fashion, baking, phone repair and more — free with certificates." },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const { data: prog = [] } = useLessonProgress();
  const done = (id: string) => prog.filter((p) => p.skill_id === id).length;
  return (
    <div>
      <PageTitle title="Free Skills Academy" sub="Learn a skill that pays. Earn a certificate." icon={Wrench} />
      {(["Tech", "Vocational"] as const).map((track) => (
        <section key={track} className="mb-6">
          <h2 className="mb-3 text-lg font-bold">{track} skills</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SKILLS.filter((s) => s.track === track).map((s) => {
              const pct = Math.round((done(s.id) / lessonCount(s)) * 100);
              return (
                <Link key={s.id} to="/skills/$skillId" params={{ skillId: s.id }} className="rounded-2xl border bg-card p-4 hover:border-primary">
                  <div className="text-3xl">{s.emoji}</div>
                  <p className="mt-2 font-bold">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.blurb}</p>
                  <Progress value={pct} className="mt-3 h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">{pct === 100 ? "Completed 🎓" : pct ? `${pct}% done` : `${lessonCount(s)} lessons`}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
