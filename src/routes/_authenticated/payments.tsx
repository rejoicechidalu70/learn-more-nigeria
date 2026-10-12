import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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
  const [email, setEmail] = useState("");
  const makeTeacher = async () => {
    const { data, error } = await supabase.rpc("make_teacher", { _email: email });
    if (error) return toast.error("Couldn't do that.");
    if (!data) return toast.error("No account with that email. Ask them to sign up first.");
    toast.success("Done! They can now upload lesson notes.");
    setEmail("");
  };
  if (!isAdmin) return <p className="py-10 text-center text-muted-foreground">Only admins can see this page.</p>;
  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="Payment approvals" sub="Check your Moniepoint account, then approve." icon={Wallet} />
      <div className="mb-6 rounded-2xl border bg-card p-4">
        <p className="font-bold">Let a teacher upload notes</p>
        <p className="mb-2 text-sm text-muted-foreground">Type the email they signed up with.</p>
        <div className="flex gap-2">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@email.com" className="h-12" />
          <Button size="lg" onClick={makeTeacher}>Make teacher</Button>
        </div>
      </div>
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
