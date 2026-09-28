import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BookOpen, Check, Download, Eye, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LEVELS, SAMPLE_NOTES, SUBJECTS_BY_LEVEL, type NoteLevel, type SampleNote } from "@/lib/data/notes";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({
    meta: [
      { title: "Lesson Notes Library — LEARN MORE" },
      { name: "description", content: "Browse, view and download lesson notes for JSS, SSS and every university course. Teachers can upload their own." },
      { property: "og:title", content: "Lesson Notes Library — LEARN MORE" },
      { property: "og:description", content: "JSS, SSS and university notes organised by level, subject, course and topic." },
    ],
  }),
  component: NotesPage,
});

function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => ((await supabase.from("user_roles").select("role")).data ?? []).map((r) => r.role),
  });
}

function NotesPage() {
  const qc = useQueryClient();
  const [level, setLevel] = useState<NoteLevel>("SSS");
  const [subject, setSubject] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [view, setView] = useState<SampleNote | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data: roles = [] } = useRoles();
  const isTeacher = roles.includes("teacher") || roles.includes("admin");
  const isAdmin = roles.includes("admin");

  const { data: uploaded = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => (await supabase.from("notes").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const term = q.trim().toLowerCase();
  const match = (s: string[]) => !term || s.join(" ").toLowerCase().includes(term);
  const samples = SAMPLE_NOTES.filter((n) => (term ? true : n.level === level && (!subject || n.subject === subject)) && match([n.title, n.subject, n.course, n.topic]));
  const files = uploaded.filter((n) => n.status === "approved" && (term ? true : n.level === level && (!subject || n.subject === subject)) && match([n.title, n.subject, n.course, n.topic]));
  const mine = uploaded.filter((n) => n.status !== "approved");

  const openFile = async (path: string, dl: boolean) => {
    const { data, error } = await supabase.storage.from("notes").createSignedUrl(path, 300, dl ? { download: true } : undefined);
    if (error || !data) return toast.error("Couldn't open this file.");
    window.open(data.signedUrl, "_blank", "noopener");
  };
  const downloadSample = (n: SampleNote) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([`${n.title}\n${n.level} > ${n.subject} > ${n.course} > ${n.topic}\n\n${n.body}\n\n— LEARN MORE`], { type: "text/plain" }));
    a.download = `${n.title}.txt`;
    a.click();
  };
  const moderate = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("notes").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notes"] });
  };

  return (
    <div>
      <PageTitle title="Lesson Notes" sub="Level › Subject/Department › Course › Topic" icon={BookOpen} />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes, courses or topics" className="h-12 pl-10" />
      </div>
      {!term && (
        <>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {LEVELS.map((l) => <button key={l} onClick={() => { setLevel(l); setSubject(null); }} className={`rounded-xl border py-3 font-bold ${level === l ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{l}</button>)}
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <button onClick={() => setSubject(null)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${!subject ? "bg-primary-soft text-primary border-primary" : ""}`}>All</button>
            {SUBJECTS_BY_LEVEL[level].map((s) => <button key={s} onClick={() => setSubject(s)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${subject === s ? "bg-primary-soft text-primary border-primary" : ""}`}>{s}</button>)}
          </div>
          {level === "University" && <p className="mb-3 rounded-xl bg-success-soft p-3 text-sm text-accent-foreground">Every university course is open to students from any department.</p>}
        </>
      )}

      {isTeacher && <Button size="lg" className="mb-4" onClick={() => setUploadOpen(true)}><Upload /> Upload lesson note</Button>}

      <div className="space-y-2">
        {samples.map((n) => (
          <div key={n.id} className="rounded-xl border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground">{n.level} › {n.subject} › {n.course} › {n.topic}</p>
            <p className="font-bold">{n.title}</p>
            <div className="mt-2 flex gap-2"><Button size="sm" variant="outline" onClick={() => setView(n)}><Eye /> View</Button><Button size="sm" variant="ghost" onClick={() => downloadSample(n)}><Download /> Download</Button></div>
          </div>
        ))}
        {files.map((n) => (
          <div key={n.id} className="rounded-xl border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground">{n.level} › {n.subject} › {n.course} › {n.topic} · {n.file_type?.toUpperCase()}</p>
            <p className="font-bold">{n.title}</p>
            <div className="mt-2 flex gap-2"><Button size="sm" variant="outline" onClick={() => openFile(n.file_path, false)}><Eye /> View</Button><Button size="sm" variant="ghost" onClick={() => openFile(n.file_path, true)}><Download /> Download</Button></div>
          </div>
        ))}
        {!samples.length && !files.length && <p className="py-6 text-center text-sm text-muted-foreground">No notes here yet.</p>}
      </div>

      {mine.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 font-bold">{isAdmin ? "Awaiting approval" : "Your uploads"}</h2>
          <div className="space-y-2">
            {mine.map((n) => (
              <div key={n.id} className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
                <div className="min-w-0 flex-1"><p className="font-semibold">{n.title}</p><p className="text-xs capitalize text-muted-foreground">{n.status} · {n.subject}</p></div>
                <Button size="sm" variant="outline" onClick={() => openFile(n.file_path, false)}><Eye /></Button>
                {isAdmin && <><Button size="sm" onClick={() => moderate(n.id, "approved")}><Check /> Approve</Button><Button size="sm" variant="destructive" onClick={() => moderate(n.id, "rejected")}><X /></Button></>}
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{view?.title}</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">{view?.level} › {view?.subject} › {view?.course} › {view?.topic}</p>
          <p className="whitespace-pre-wrap text-sm">{view?.body}</p>
        </DialogContent>
      </Dialog>
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} onDone={() => qc.invalidateQueries({ queryKey: ["notes"] })} />
    </div>
  );
}

function UploadDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [level, setLevel] = useState<NoteLevel>("SSS");
  const [f, setF] = useState({ subject: "", course: "", topic: "", title: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const subjects = useMemo(() => SUBJECTS_BY_LEVEL[level], [level]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const path = `${u.user!.id}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from("notes").upload(path, file);
    if (up.error) { setBusy(false); return toast.error("Upload failed: " + up.error.message); }
    const { error } = await supabase.from("notes").insert({ level, subject: f.subject || subjects[0], course: f.course, topic: f.topic, title: f.title, file_path: path, file_type: ext });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Uploaded! It will go public after admin approval.");
    onDone(); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Upload lesson note</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">{LEVELS.map((l) => <button type="button" key={l} onClick={() => setLevel(l)} className={`rounded-lg border py-2 text-sm font-bold ${level === l ? "border-primary bg-primary-soft text-primary" : ""}`}>{l}</button>)}</div>
          <div><Label>Subject / Department</Label>
            <select className="h-11 w-full rounded-md border bg-background px-3" value={f.subject || subjects[0]} onChange={(e) => setF({ ...f, subject: e.target.value })}>{subjects.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <div><Label>Course / Class</Label><Input required placeholder="e.g. SS 2 or CSC 101" value={f.course} onChange={(e) => setF({ ...f, course: e.target.value })} /></div>
          <div><Label>Topic</Label><Input required value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} /></div>
          <div><Label>Title</Label><Input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div><Label>File (PDF or DOCX, max 20MB)</Label><Input required type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Uploading…" : "Submit for approval"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
