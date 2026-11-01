import { createServerFn } from "@tanstack/react-start";
import type { Question } from "@/lib/data/questions";
import { questionSetInput } from "@/lib/questions-gen.server";

export const generateQuestionSetServer = createServerFn({ method: "POST" })
  .inputValidator(questionSetInput)
  .handler(async ({ data }): Promise<Question[]> => (await import("@/lib/questions-gen.server")).runQuestionGeneration(data));

// The AI key only exists on the Lovable-hosted site, so other hosts (Netlify) send the request there.
function onLovableHost() {
  if (typeof window === "undefined") return true;
  const h = window.location.hostname;
  return h.endsWith("lovable.app") || h.endsWith("lovableproject.com") || h === "localhost";
}

export async function generateQuestionSet(args: { data: z.infer<typeof questionSetInput> }): Promise<Question[]> {
  if (onLovableHost()) return generateQuestionSetServer(args);
  const { supabase } = await import("@/integrations/supabase/client");
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("Please sign in to load practice questions.");
  const res = await fetch("https://skill-naija-leap.lovable.app/api/questions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(args.data),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Couldn't prepare the questions. Check your internet and try again.");
  }
  return (await res.json()) as Question[];
}
