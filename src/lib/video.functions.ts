import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Finds the first matching video for a lesson so it can play inside the app.
export const findVideoId = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ q: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(data.q)}&hl=en`, {
        headers: { "accept-language": "en", "user-agent": "Mozilla/5.0" },
      });
      const html = await res.text();
      const m = html.match(/"videoId":"([\w-]{11})"/);
      return { id: m?.[1] ?? null };
    } catch {
      return { id: null };
    }
  });
