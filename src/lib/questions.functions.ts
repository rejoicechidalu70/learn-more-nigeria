import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Question } from "@/lib/data/questions";

export const generateQuestionSet = createServerFn({ method: "POST" })
  .inputValidator(z.object({ exam: z.string().max(10), subject: z.string().max(40), year: z.number().optional(), set: z.number().int().min(1).max(1000) }))
  .handler(async ({ data }): Promise<Question[]> => {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Question service is not configured.");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      prompt: `Write 50 NEW multiple-choice ${data.exam} ${data.subject} questions in the style of Nigerian ${data.exam} past papers${data.year ? ` (${data.year} syllabus)` : ""}. This is set number ${data.set}; cover different topics and vary difficulty so sets don't repeat. Each question has exactly 4 options, one correct, and a short explanation in simple English.
Return ONLY JSON: {"questions":[{"topic":"...","question":"...","options":["","","",""],"answer":0,"explanation":"..."}]} with answer as the 0-based index.`,
      providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", include: ["reasoning.encrypted_content"] } },
    });
    const text = await result.text;
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as { questions: Omit<Question, "id" | "exams" | "year" | "subject">[] };
    const stamp = `${data.set}-${Date.now().toString(36)}`;
    return json.questions
      .filter((q) => Array.isArray(q.options) && q.options.length === 4 && q.answer >= 0 && q.answer < 4)
      .slice(0, 50)
      .map((q, i) => ({ ...q, id: `ai-${stamp}-${i}`, exams: [data.exam as Question["exams"][number]], year: data.year ?? new Date().getFullYear(), subject: data.subject }));
  });
