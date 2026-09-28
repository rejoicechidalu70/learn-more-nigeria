import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const MODEL = "openai/gpt-6-astra";

function systemPrompt(o: { level: string; subject: string; language: string }) {
  return `You are "Teacher Ada", the friendly AI tutor inside LEARN MORE, an education app for Nigerian students.
Student level: ${o.level === "university" ? "University undergraduate" : "Secondary school (JSS/SSS), preparing for WAEC, NECO and JAMB"}.
Subject/course focus: ${o.subject}.
Language: ${o.language === "pidgin" ? "Reply in simple Nigerian Pidgin English, keeping technical terms in standard English." : "Reply in simple, clear English."}

How to teach:
- Explain step by step, with short paragraphs, bullet points and worked examples. Use Nigerian everyday examples (naira, markets, danfo, jollof) where helpful.
- For past questions, show why the correct option is right and why the others are wrong.
- When the student asks to be quizzed, ask ONE multiple-choice question at a time (options A–D), wait for their answer, then mark it and explain.
- End longer explanations with a quick check question.
- Keep answers focused; aim for under 250 words unless the student asks for more.

Safety rules:
- Stay on educational topics (school subjects, university courses, exams, study skills, careers, and vocational/tech skills). Politely redirect anything else.
- Never produce harmful, sexual, violent, hateful or dangerous content. Do not help with exam malpractice (e.g. leaked "expo" questions).
- If a student seems distressed or unsafe, respond kindly and encourage them to talk to a trusted adult, teacher or counsellor.`;
}

export async function handleTutorChat(request: Request) {
  const auth = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!auth) return new Response("Please sign in to use the AI Tutor.", { status: 401 });
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: u, error: uErr } = await sb.auth.getUser(auth);
  if (uErr || !u.user) return new Response("Your session expired. Please sign in again.", { status: 401 });

  let body: { messages?: UIMessage[]; level?: string; subject?: string; language?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid request", { status: 400 });
  }
  if (!Array.isArray(body.messages)) return new Response("Invalid request", { status: 400 });
  const messages = body.messages.slice(-30);

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return new Response("AI Tutor is not configured.", { status: 500 });

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    system: systemPrompt({
      level: String(body.level ?? "secondary"),
      subject: String(body.subject ?? "General").slice(0, 80),
      language: String(body.language ?? "english"),
    }),
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: false,
      onError: (e) => {
        const msg = String((e as Error)?.message ?? e);
        if (msg.includes("402")) return "AI credits have run out. Please try again later.";
        if (msg.includes("429")) return "The tutor is busy right now. Please wait a moment and try again.";
        return "Sorry, the tutor couldn't answer. Please try again.";
      },
    }),
    runIdFetch,
  );
}
