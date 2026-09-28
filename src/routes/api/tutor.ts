import { createFileRoute } from "@tanstack/react-router";
import { handleTutorChat } from "@/lib/ai/tutor.server";

export const Route = createFileRoute("/api/tutor")({
  server: { handlers: { POST: ({ request }) => handleTutorChat(request) } },
});
