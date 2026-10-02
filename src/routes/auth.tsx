import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — LEARN MORE" },
      { name: "description", content: "Create your free LEARN MORE account to save your scores, chats and certificates." },
      { property: "og:title", content: "Sign in — LEARN MORE" },
      { property: "og:description", content: "Create your free LEARN MORE account." },
    ],
  }),
  component: AuthPage,
});

const TYPES = [
  { v: "secondary", l: "Secondary student" },
  { v: "university", l: "University student" },
  { v: "teacher", l: "Teacher / Lecturer" },
  { v: "skill", l: "Skill learner" },
];

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("secondary");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/dashboard" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name, user_type: type } },
      });
      if (error) toast.error(error.message);
      else if (!data.session) toast.success("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    }
    setBusy(false);
  };


  return (
    <div className="mx-auto max-w-sm py-6">
      <div className="mb-6 text-center">
        <img src={logo} alt="" width={64} height={64} className="mx-auto size-16" />
        <h1 className="mt-3 text-2xl font-extrabold">{mode === "in" ? "Welcome back" : "Join LEARN MORE"}</h1>
        <p className="text-sm text-muted-foreground">Learn anything. Anytime.</p>
      </div>
      <Button variant="outline" size="xl" className="w-full" onClick={google}>Continue with Google</Button>
      <div className="my-4 text-center text-xs text-muted-foreground">or use email</div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "up" && (
          <>
            <div><Label htmlFor="n">Full name</Label><Input id="n" required value={name} onChange={(e) => setName(e.target.value)} className="h-12" /></div>
            <div>
              <Label>I am a…</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {TYPES.map((t) => (
                  <button type="button" key={t.v} onClick={() => setType(t.v)} className={`rounded-xl border p-3 text-left text-sm font-medium ${type === t.v ? "border-primary bg-primary-soft text-primary" : ""}`}>{t.l}</button>
                ))}
              </div>
            </div>
          </>
        )}
        <div><Label htmlFor="e">Email</Label><Input id="e" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" /></div>
        <div><Label htmlFor="p">Password</Label><Input id="p" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" /></div>
        <Button type="submit" size="xl" className="w-full" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</Button>
      </form>
      <button className="mt-4 w-full text-center text-sm font-semibold text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "New here? Create a free account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
