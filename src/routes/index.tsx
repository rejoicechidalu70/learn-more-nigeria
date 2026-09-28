import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, MessageCircle, PenLine, Video, Wrench, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LEARN MORE — Learn anything. Anytime." },
      { name: "description", content: "Free JAMB, WAEC & NECO CBT practice, an AI tutor, catch-up classes, lesson notes and free skills training for Nigerian learners." },
      { property: "og:title", content: "LEARN MORE — Learn anything. Anytime." },
      { property: "og:description", content: "Past questions, AI tutor, classes, notes and free skills — built for Nigerian students." },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { to: "/practice", icon: PenLine, title: "Past Questions & CBT", body: "JAMB, WAEC and NECO with instant explanations and timed exam mode.", tone: "bg-primary-soft text-primary" },
  { to: "/tutor", icon: MessageCircle, title: "AI Tutor", body: "Ask anything — simple English or Pidgin, step by step.", tone: "bg-success-soft text-success" },
  { to: "/classes", icon: Video, title: "Classes & Catch-Up", body: "Join live or watch what you missed, with notes.", tone: "bg-primary-soft text-primary" },
  { to: "/notes", icon: BookOpen, title: "Lesson Notes", body: "JSS, SSS and every university course.", tone: "bg-success-soft text-success" },
  { to: "/skills", icon: Wrench, title: "Free Skills Academy", body: "Tech and vocational skills with certificates.", tone: "bg-primary-soft text-primary" },
] as const;

function Home() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-primary px-5 py-8 text-primary-foreground md:px-10 md:py-12">
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-card"><img src={logo} alt="" width={48} height={48} className="size-12" /></div>
          <p className="text-sm font-semibold uppercase tracking-widest opacity-90">For Nigerian learners</p>
        </div>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">Learn anything.<br />Anytime.</h1>
        <p className="mt-3 max-w-xl text-base opacity-90 md:text-lg">Pass JAMB, WAEC and NECO, understand your courses, and learn a skill that pays — all free, on any phone.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="xl" variant="secondary"><Link to="/practice">Start practising</Link></Button>
          <Button asChild size="xl" className="bg-success text-success-foreground hover:bg-success/90"><Link to="/tutor">Ask the AI Tutor</Link></Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} className="group flex gap-4 rounded-2xl border bg-card p-5 transition-colors hover:border-primary">
            <div className={`grid size-12 shrink-0 place-items-center rounded-xl ${f.tone}`}><f.icon className="size-6" /></div>
            <div>
              <h2 className="font-bold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          </Link>
        ))}
        <div className="flex gap-4 rounded-2xl border border-dashed p-5">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-muted"><Wifi className="size-6" /></div>
          <div>
            <h2 className="font-bold">Light on data</h2>
            <p className="mt-1 text-sm text-muted-foreground">Text-first pages, videos only when you tap. Works on cheap phones.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
