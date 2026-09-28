import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Award, Flame, LayoutDashboard, PenLine, PlayCircle, Video } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { CLASSES, classTime } from "@/lib/data/classes";
import { SKILLS, lessonCount } from "@/lib/data/skills";
import { useCertificates, useLessonProgress } from "@/lib/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — LEARN MORE" }, { name: "description", content: "Your progress, streaks, CBT scores, catch-up classes and certificates." }, { property: "og:title", content: "My Dashboard — LEARN MORE" }, { property: "og:description", content: "Track your learning progress." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: profile, refetch } = useQuery({ queryKey: ["profile"], queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data });
  const { data: attempts = [] } = useQuery({ queryKey: ["attempts"], queryFn: async () => (await supabase.from("cbt_attempts").select("*").order("created_at", { ascending: false }).limit(20)).data ?? [] });
  const { data: att = [] } = useQuery({ queryKey: ["attendance"], queryFn: async () => (await supabase.from("class_attendance").select("class_id")).data ?? [] });
  const { data: prog = [] } = useLessonProgress();
  const { data: certs = [] } = useCertificates();

  useEffect(() => {
    if (!profile) return;
    const today = new Date().toISOString().slice(0, 10);
    if (profile.last_active_date === today) return;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const streak = profile.last_active_date === y ? profile.streak_count + 1 : 1;
    supabase.from("profiles").update({ streak_count: streak, last_active_date: today }).eq("id", profile.id).then(() => refetch());
  }, [profile, refetch]);

  const seen = new Set(att.map((a) => a.class_id));
  const missed = CLASSES.filter((c) => classTime(c).status === "past" && !seen.has(c.id));
  const started = SKILLS.map((s) => ({ s, done: prog.filter((p) => p.skill_id === s.id).length })).filter((x) => x.done > 0);
  const recs = started.filter((x) => x.done < lessonCount(x.s)).map(({ s, done }) => ({ s, lesson: s.modules.flatMap((m) => m.lessons)[done] }));
  const weak = attempts[0] ? Object.entries(attempts[0].topic_breakdown as Record<string, { correct: number; total: number }>).filter(([, v]) => v.correct < v.total).map(([t]) => t) : [];
  const avg = attempts.length ? Math.round(attempts.reduce((n, a) => n + (a.score / a.total) * 100, 0) / attempts.length) : 0;

  return (
    <div className="space-y-5">
      <PageTitle title={`Hi, ${profile?.full_name ?? "learner"} 👋`} sub="Here's your learning at a glance." icon={LayoutDashboard} />
      <div className="grid grid-cols-3 gap-3">
        <Stat icon={<Flame className="text-warning" />} value={profile?.streak_count ?? 0} label="day streak" />
        <Stat icon={<PenLine className="text-primary" />} value={`${avg}%`} label="avg CBT" />
        <Stat icon={<Award className="text-success" />} value={certs.length} label="certificates" />
      </div>

      <Card title="Recommended next">
        {recs.map(({ s, lesson }) => (
          <Link key={s.id} to="/skills/$skillId" params={{ skillId: s.id }} className="flex items-center gap-3 rounded-xl bg-muted p-3"><PlayCircle className="text-primary" /><div><p className="font-semibold">{lesson.title}</p><p className="text-xs text-muted-foreground">{s.name}</p></div></Link>
        ))}
        {weak.length > 0 && <Link to="/practice" className="flex items-center gap-3 rounded-xl bg-muted p-3"><PenLine className="text-primary" /><div><p className="font-semibold">Revise: {weak.slice(0, 3).join(", ")}</p><p className="text-xs text-muted-foreground">Weak topics from your last CBT</p></div></Link>}
        {!recs.length && !weak.length && <Link to="/practice" className="block rounded-xl bg-muted p-3 font-semibold">Take your first CBT practice →</Link>}
      </Card>

      <Card title="Recent CBT scores">
        {attempts.slice(0, 5).map((a) => (
          <div key={a.id}><div className="flex justify-between text-sm"><span>{a.exam} · {a.subject} · {a.mode}</span><b>{a.score}/{a.total}</b></div><Progress value={(a.score / a.total) * 100} className="mt-1 h-2" /></div>
        ))}
        {!attempts.length && <p className="text-sm text-muted-foreground">No attempts yet.</p>}
      </Card>

      <Card title={`Catch up (${missed.length})`}>
        {missed.map((c) => <Link key={c.id} to="/classes" className="flex items-center gap-3 rounded-xl bg-muted p-3"><Video className="text-warning" /><div><p className="font-semibold">{c.title}</p><p className="text-xs text-muted-foreground">{c.subject} · {c.teacher}</p></div></Link>)}
        {!missed.length && <p className="text-sm text-muted-foreground">You're all caught up 🎉</p>}
      </Card>

      <Card title="Course progress">
        {started.map(({ s, done }) => <div key={s.id}><div className="flex justify-between text-sm"><span>{s.emoji} {s.name}</span><b>{done}/{lessonCount(s)}</b></div><Progress value={(done / lessonCount(s)) * 100} className="mt-1 h-2" /></div>)}
        {!started.length && <Link to="/skills" className="text-sm font-semibold text-primary">Start a free skill →</Link>}
      </Card>

      <Card title="Certificates">
        {certs.map((c) => <Link key={c.id} to="/certificate/$skillId" params={{ skillId: c.skill_id }} className="flex items-center gap-3 rounded-xl bg-success-soft p-3 font-semibold"><Award className="text-success" /> {c.skill_name}</Link>)}
        {!certs.length && <p className="text-sm text-muted-foreground">Complete a skill to earn one.</p>}
      </Card>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return <div className="rounded-2xl border bg-card p-3 text-center">{icon && <div className="mx-auto mb-1 w-fit">{icon}</div>}<p className="text-2xl font-extrabold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border bg-card p-4"><h2 className="mb-3 font-bold">{title}</h2><div className="space-y-2">{children}</div></section>;
}
