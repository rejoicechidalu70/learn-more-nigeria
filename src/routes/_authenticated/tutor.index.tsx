import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, Plus, Trash2 } from "lucide-react";
import { PageTitle } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { createThread, deleteThread, loadThreads, type TutorThread } from "@/lib/tutor-store";
import { SUBJECTS } from "@/lib/data/questions";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/tutor/")({
  head: () => ({
    meta: [
      { title: "AI Tutor — LEARN MORE" },
      { name: "description", content: "Chat with Teacher Ada, a friendly AI tutor that explains topics step by step in simple English or Pidgin." },
      { property: "og:title", content: "AI Tutor — LEARN MORE" },
      { property: "og:description", content: "Step-by-step explanations and quizzes in simple English or Pidgin." },
    ],
  }),
  component: TutorHome,
});

const UNI = ["Computer Science", "Economics", "Law", "Medicine", "Engineering", "Accounting", "Microbiology"];

function TutorHome() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<TutorThread[]>([]);
  const [level, setLevel] = useState<"secondary" | "university">("secondary");
  const [subject, setSubject] = useState("Mathematics");
  const [language, setLanguage] = useState<"english" | "pidgin">("english");
  useEffect(() => setThreads(loadThreads()), []);

  const start = () => {
    const t = createThread({ level, subject, language, title: `${subject} chat` });
    navigate({ to: "/tutor/$threadId", params: { threadId: t.id } });
  };
  const list = level === "secondary" ? SUBJECTS : UNI;

  return (
    <div>
      <PageTitle title="AI Tutor" sub="Your chats are saved on this phone/browser." icon={MessageCircle} />
      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-4 flex items-center gap-3">
          <img src={logo} alt="" width={48} height={48} className="size-12" />
          <div><p className="font-bold">Teacher Ada</p><p className="text-sm text-muted-foreground">Explains simply, gives examples, and quizzes you.</p></div>
        </div>
        <p className="mb-2 text-sm font-bold">Level</p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(["secondary", "university"] as const).map((l) => (
            <button key={l} onClick={() => { setLevel(l); setSubject(l === "secondary" ? SUBJECTS[0] : UNI[0]); }} className={`rounded-xl border p-3 font-semibold capitalize ${level === l ? "border-primary bg-primary-soft text-primary" : ""}`}>{l}</button>
          ))}
        </div>
        <p className="mb-2 text-sm font-bold">Subject / course</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {list.map((s) => <button key={s} onClick={() => setSubject(s)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${subject === s ? "border-primary bg-primary text-primary-foreground" : ""}`}>{s}</button>)}
        </div>
        <p className="mb-2 text-sm font-bold">Language</p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button onClick={() => setLanguage("english")} className={`rounded-xl border p-3 font-semibold ${language === "english" ? "border-success bg-success-soft text-success" : ""}`}>Simple English</button>
          <button onClick={() => setLanguage("pidgin")} className={`rounded-xl border p-3 font-semibold ${language === "pidgin" ? "border-success bg-success-soft text-success" : ""}`}>Pidgin</button>
        </div>
        <Button size="xl" className="w-full" onClick={start}><Plus /> Start new chat</Button>
      </div>

      <h2 className="mb-2 mt-6 font-bold">Continue learning</h2>
      {threads.length === 0 && <p className="text-sm text-muted-foreground">No chats yet.</p>}
      <div className="space-y-2">
        {threads.map((t) => (
          <div key={t.id} className="flex items-center gap-2 rounded-xl border bg-card p-3">
            <Link to="/tutor/$threadId" params={{ threadId: t.id }} className="min-w-0 flex-1">
              <p className="truncate font-semibold">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.subject} · {t.language === "pidgin" ? "Pidgin" : "English"} · {new Date(t.updatedAt).toLocaleDateString()}</p>
            </Link>
            <Button variant="ghost" size="icon" aria-label="Delete chat" onClick={() => { deleteThread(t.id); setThreads(loadThreads()); }}><Trash2 /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
