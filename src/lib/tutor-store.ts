import type { UIMessage } from "ai";

export type TutorThread = {
  id: string;
  title: string;
  updatedAt: number;
  level: "secondary" | "university";
  subject: string;
  language: "english" | "pidgin";
  messages: UIMessage[];
  pending?: string; // first message to auto-send
};

const KEY = "lm-tutor-threads";

export function loadThreads(): TutorThread[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAll(t: TutorThread[]) {
  localStorage.setItem(KEY, JSON.stringify(t));
}

export function getThread(id: string) {
  return loadThreads().find((t) => t.id === id);
}

export function createThread(p: Partial<TutorThread> = {}): TutorThread {
  const t: TutorThread = {
    id: crypto.randomUUID().slice(0, 8),
    title: p.title ?? "New chat",
    updatedAt: Date.now(),
    level: p.level ?? "secondary",
    subject: p.subject ?? "General",
    language: p.language ?? "english",
    messages: [],
    pending: p.pending,
  };
  saveAll([t, ...loadThreads()]);
  return t;
}

export function updateThread(id: string, patch: Partial<TutorThread>) {
  const all = loadThreads().map((t) => (t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t));
  saveAll(all);
}

export function deleteThread(id: string) {
  saveAll(loadThreads().filter((t) => t.id !== id));
}
