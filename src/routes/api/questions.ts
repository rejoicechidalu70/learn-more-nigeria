import { createFileRoute } from "@tanstack/react-router";
import { questionSetInput, runQuestionGeneration } from "@/lib/questions-gen.server";
import { createClient } from "@supabase/supabase-js";

// Allow other hosts (e.g. the Netlify copy) to fetch AI question sets; callers still need a signed-in token.
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

export const Route = createFileRoute("/api/questions")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!auth) return withCors(Response.json({ error: "Please sign in to load practice questions." }, { status: 401 }));
        const sb = createClient(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_PUBLISHABLE_KEY"]!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        const { data: u } = await sb.auth.getUser(auth);
        if (!u.user) return withCors(Response.json({ error: "Your session expired. Please sign in again." }, { status: 401 }));

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return withCors(Response.json({ error: "Invalid request" }, { status: 400 }));
        }
        const parsed = questionSetInput.safeParse(body);
        if (!parsed.success) return withCors(Response.json({ error: "Invalid request" }, { status: 400 }));

        try {
          const questions = await runQuestionGeneration(parsed.data);
          return withCors(Response.json(questions));
        } catch (e) {
          const msg = String((e as Error)?.message ?? e);
          console.error("[questions] generation failed:", msg);
          return withCors(Response.json({ error: "Couldn't prepare the questions right now. Please try again." }, { status: 502 }));
        }
      },
    },
  },
});
