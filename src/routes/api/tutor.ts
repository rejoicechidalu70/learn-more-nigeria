import { createFileRoute } from "@tanstack/react-router";
import { handleTutorChat } from "@/lib/ai/tutor.server";

// Allow other hosts (e.g. the Netlify copy) to call the tutor; callers still need a signed-in token.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

function withCors(res: Response) {
  const r = new Response(res.body, res);
  for (const [k, v] of Object.entries(CORS)) r.headers.set(k, v);
  return r;
}

export const Route = createFileRoute("/api/tutor")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => withCors(await handleTutorChat(request)),
    },
  },
});
