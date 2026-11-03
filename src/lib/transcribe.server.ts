/** Server-side voice-note transcription via the Lovable AI gateway (OpenAI-compatible audio API). */

const MAX_BYTES = 15_000_000;

export async function transcribeVoiceNoteServer(file: File): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Voice notes are not set up yet. Please try again later.");
  if (file.size > MAX_BYTES) throw new Error("That voice note is too long. Please keep it under 60 seconds.");

  const fd = new FormData();
  fd.append("file", file, file.name || "voice-note.webm");
  fd.append("model", "openai/gpt-transcribe");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "Lovable-API-Key": apiKey },
    body: fd,
  });
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { error?: { message?: string } | string } | null;
    const msg = typeof detail?.error === "string" ? detail.error : detail?.error?.message;
    console.error("[transcribe] gateway error:", res.status, msg ?? "unknown");
    throw new Error("Couldn't hear that clearly. Please try again, or type your question.");
  }
  const data = (await res.json().catch(() => null)) as { text?: string } | null;
  return (data?.text ?? "").trim();
}
