/** Sends a recorded voice note for transcription. On the Lovable-hosted site it calls the
 *  /api/transcribe route locally; other hosts (Netlify) send it to the published Lovable site,
 *  because the AI key only exists there. Same routing as the tutor and question generation. */

function transcribeApi() {
  if (typeof window === "undefined") return "/api/transcribe";
  const h = window.location.hostname;
  const onLovable = h.endsWith("lovable.app") || h.endsWith("lovableproject.com") || h === "localhost";
  return onLovable ? "/api/transcribe" : "https://skill-naija-leap.lovable.app/api/transcribe";
}

export async function transcribeVoiceNote(blob: Blob): Promise<string> {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("Please sign in to send voice notes.");

  const file = new File([blob], `voice-note.${blob.type.includes("mp4") ? "mp4" : "webm"}`, { type: blob.type || "audio/webm" });
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(transcribeApi(), {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: fd,
  });
  const body = (await res.json().catch(() => null)) as { text?: string; error?: string } | null;
  if (!res.ok) throw new Error(body?.error ?? "Voice note failed. Type your question instead.");
  return body?.text ?? "";
}
