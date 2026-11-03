import { createFileRoute } from "@tanstack/react-router";
import { transcribeVoiceNoteServer } from "@/lib/transcribe.server";
import { createClient } from "@supabase/supabase-js";

// Allow other hosts (e.g. the Netlify copy) to send tutor voice notes; callers still need a signed-in token.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function withCors(res: Response) {
  const r = new Response(res.body, res);
  for (const [k, v] of Object.entries(CORS)) r.headers.set(k, v);
  return r;
}

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!auth) return withCors(Response.json({ error: "Please sign in to send voice notes." }, { status: 401 }));
        const sb = createClient(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_PUBLISHABLE_KEY"]!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        const { data: u } = await sb.auth.getUser(auth);
        if (!u.user) return withCors(Response.json({ error: "Your session expired. Please sign in again." }, { status: 401 }));

        let file: FormDataEntryValue | null = null;
        try {
          file = (await request.formData()).get("file");
        } catch {
          return withCors(Response.json({ error: "Invalid request" }, { status: 400 }));
        }
        if (!(file instanceof File)) return withCors(Response.json({ error: "No voice note attached." }, { status: 400 }));

        try {
          const text = await transcribeVoiceNoteServer(file);
          return withCors(Response.json({ text }));
        } catch (e) {
          const msg = String((e as Error)?.message ?? e);
          console.error("[transcribe] failed:", msg);
          return withCors(Response.json({ error: "Couldn't hear that clearly. Please try again, or type your question." }, { status: 502 }));
        }
      },
    },
  },
});
