import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { skillById } from "@/lib/data/skills";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({
    meta: [
      { title: "Payment approvals — LEARN MORE" },
      { name: "description", content: "Approve student payments for premium skill classes." },
      { property: "og:title", content: "Payment approvals — LEARN MORE" },
      { property: "og:description", content: "Approve premium class payments." },
    ],
  }),
  component: Payments,
});

function Payments() {
  const qc = useQueryClient();
  const { data: isAdmin } = useQuery({ queryKey: ["is_admin"], queryFn: async () => (await supabase.rpc("is_admin")).data ?? false });
  const { data: rows = [] } = useQuery({
    queryKey: ["unlock_requests"],
    enabled: !!isAdmin,
    queryFn: async () => (await supabase.from("skill_unlocks").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const approve = async (id: string) => {
    const { error } = await supabase.from("skill_unlocks").update({ status: "approved" }).eq("id", id);
    if (error) return toast.error("Couldn't approve.");
    toast.success("Unlocked!");
    qc.invalidateQueries({ queryKey: ["unlock_requests"] });
  };
  if (!isAdmin) return <p className="py-10 text-center text-muted-foreground">Only admins can see this page.</p>;
  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="Payment approvals" sub="Check your Moniepoint account, then approve." icon={Wallet} />
      <div className="space-y-2">
        {rows.length === 0 && <p className="text-muted-foreground">No payments yet.</p>}
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <div className="flex-1">
              <p className="font-bold">{r.payer_name}</p>
              <p className="text-sm text-muted-foreground">{skillById(r.skill_id)?.name ?? r.skill_id} · {new Date(r.created_at).toLocaleString()}</p>
            </div>
            {r.status === "approved" ? <span className="text-sm font-semibold text-success">Approved</span> : <Button onClick={() => approve(r.id)}>Approve</Button>}
          </div>
        ))}
      </div>
    </div>
  );
}
