import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLessonProgress() {
  return useQuery({
    queryKey: ["lesson_progress"],
    queryFn: async () => (await supabase.from("lesson_progress").select("skill_id, lesson_id, created_at")).data ?? [],
  });
}

export function useCertificates() {
  return useQuery({
    queryKey: ["certificates"],
    queryFn: async () => (await supabase.from("certificates").select("*").order("issued_at", { ascending: false })).data ?? [],
  });
}
