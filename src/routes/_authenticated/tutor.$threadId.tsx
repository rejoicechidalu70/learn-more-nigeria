import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Mic, Square, X } from "lucide-react";
import { toast } from "sonner";
import { transcribeVoiceNote } from "@/lib/transcribe.functions";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message-lite";
import { SimpleMarkdown } from "@/components/simple-markdown";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { getThread, updateThread, type TutorThread } from "@/lib/tutor-store";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/tutor/$threadId")({
  head: () => ({ meta: [{ title: "Chat with Teacher Ada — LEARN MORE" }, { name: "description", content: "Your AI tutor conversation." }, { property: "og:title", content: "AI Tutor chat — LEARN MORE" }, { property: "og:description", content: "Your AI tutor conversation." }] }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const [thread, setThread] = useState<TutorThread | null | undefined>(undefined);
  useEffect(() => setThread(getThread(threadId) ?? null), [threadId]);
  if (thread === undefined) return null;
  if (thread === null) return <div className="py-10 text-center">Chat not found. <Link to="/tutor" className="text-primary">Back to tutor</Link></div>;
  return <ChatWindow key={thread.id} thread={thread} />;
}

const QUICK = ["Explain this topic simply", "Give me a worked example", "Quiz me with 3 questions", "Summarise for revision"];

// The AI key only exists on the Lovable-hosted site, so other hosts (Netlify) send tutor chats there.
function tutorApi() {
  const h = typeof window !== "undefined" ? window.location.hostname : "";
  const onLovable = h.endsWith("lovable.app") || h.endsWith("lovableproject.com") || h === "localhost";
  return onLovable ? "/api/tutor" : "https://skill-naija-leap.lovable.app/api/tutor";
}

function ChatWindow({ thread }: { thread: TutorThread }) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sentPending = useRef(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const cancelled = useRef(false);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: tutorApi(),
        body: { level: thread.level, subject: thread.subject, language: thread.language },
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
        },
      }),
    [thread.level, thread.subject, thread.language],
  );
  const { messages, sendMessage, status, stop } = useChat({
    id: thread.id,
    messages: thread.messages,
    transport,
    onError: (e) => toast.error(e.message || "Couldn't reach the tutor. Check your internet."),
  });

  useEffect(() => {
    if (status === "streaming") return;
    const first = messages.find((m) => m.role === "user");
    const text = first?.parts.find((p) => p.type === "text");
    const patch: Partial<TutorThread> = { messages };
    if (thread.title.endsWith("chat") && text && "text" in text) patch.title = text.text.slice(0, 50);
    if (messages.length) updateThread(thread.id, patch);
    if (status === "ready") inputRef.current?.focus();
  }, [messages, status, thread.id, thread.title]);

  useEffect(() => {
    if (thread.pending && !sentPending.current && thread.messages.length === 0) {
      sentPending.current = true;
      updateThread(thread.id, { pending: undefined });
      sendMessage({ text: thread.pending });
    }
  }, [thread, sendMessage]);

  const send = (text: string) => {
    if (!text.trim() || status === "submitted" || status === "streaming") return;
    sendMessage({ text });
    setInput("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const types = ["audio/webm", "audio/mp4", "audio/aac", "audio/ogg"];
      const supported = typeof MediaRecorder !== "undefined" ? types.find((t) => MediaRecorder.isTypeSupported(t)) : undefined;
      const mr = new MediaRecorder(stream, supported ? { mimeType: supported } : undefined);
      chunks.current = [];
      cancelled.current = false;
      mr.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        if (cancelled.current) return;
        const blob = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" });
        if (blob.size < 2000) return toast.error("That was too short — hold the mic and ask your question.");
        setTranscribing(true);
        try {
          const text = await transcribeVoiceNote(blob);
          if (text.trim()) { setInput(""); sendMessage({ text: text.trim() }); }
          else toast.error("Couldn't hear you clearly. Try again, or type your question.");
        } catch (e) {
          toast.error((e as Error).message || "Voice note failed. Type your question instead.");
        }
        setTranscribing(false);
      };
      mr.start();
      recorder.current = mr;
      setRecording(true);
    } catch {
      toast.error("Allow the microphone to send voice notes.");
    }
  };
  const finishRecording = () => recorder.current?.stop();
  const cancelRecording = () => {
    cancelled.current = true;
    recorder.current?.stop();
    toast("Voice note cancelled.");
  };

  return (
    <div className="-mx-4 -my-5 flex h-[calc(100dvh-3.5rem-5rem)] flex-col md:h-[calc(100dvh-3.5rem)]">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Link to="/tutor" className="p-1" aria-label="Back"><ChevronLeft /></Link>
        <img src={logo} alt="" width={28} height={28} className="size-7" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">Teacher Ada</p>
          <p className="text-xs text-muted-foreground">{thread.subject} · {thread.level} · {thread.language === "pidgin" ? "Pidgin" : "English"}</p>
        </div>
      </div>
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 ? (
            <ConversationEmptyState icon={<img src={logo} alt="" width={56} height={56} className="size-14" />} title={`Let's learn ${thread.subject}!`} description="Ask any question, or pick a quick start below." />
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent className={m.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                  {m.parts.map((p, i) => (p.type === "text" ? (m.role === "assistant" ? <SimpleMarkdown key={i}>{p.text}</SimpleMarkdown> : <p key={i} className="whitespace-pre-wrap">{p.text}</p>) : null))}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer className="text-sm">Teacher Ada is thinking…</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="mx-auto w-full max-w-3xl space-y-2 p-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK.map((q) => <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold">{q}</button>)}
        </div>
        {recording && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive bg-destructive/10 px-3 py-2 text-sm font-semibold">
            <span className="size-2 shrink-0 animate-pulse rounded-full bg-destructive" /> Recording… ask your question
            <button onClick={cancelRecording} aria-label="Cancel voice note" className="ml-auto rounded-full p-1.5 hover:bg-muted"><X className="size-4" /></button>
            <button onClick={finishRecording} aria-label="Send voice note" className="rounded-full bg-primary p-1.5 text-primary-foreground"><Square className="size-4" /></button>
          </div>
        )}
        <PromptInput onSubmit={(m) => send(m.text)}>
          <PromptInputTextarea ref={inputRef} autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder={transcribing ? "Listening to your voice note…" : "Ask Teacher Ada anything… or tap the mic"} />
          <PromptInputFooter className="justify-end">
            <button
              type="button"
              onClick={startRecording}
              disabled={recording || transcribing || status === "submitted" || status === "streaming"}
              aria-label="Record a voice note"
              className="mr-1 grid size-10 shrink-0 place-items-center rounded-full bg-success-soft text-success transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              <Mic className="size-5" />
            </button>
            <PromptInputSubmit status={status} onStop={stop} disabled={!input.trim() && status === "ready"} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
