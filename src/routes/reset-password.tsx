import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — LEARN MORE" },
      { name: "description", content: "Choose a new password for your LEARN MORE account." },
      { property: "og:title", content: "Set a new password — LEARN MORE" },
      { property: "og:description", content: "Choose a new password for your LEARN MORE account." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated!"); navigate({ to: "/dashboard" }); }
  };
  return (
    <div className="mx-auto max-w-sm py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Set a new password</h1>
      <form onSubmit={submit} className="space-y-3">
        <div><Label htmlFor="p">New password</Label><Input id="p" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" /></div>
        <Button type="submit" size="xl" className="w-full" disabled={busy}>Save password</Button>
      </form>
    </div>
  );
}
