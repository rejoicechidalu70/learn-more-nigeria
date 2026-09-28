import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCertificates } from "@/lib/progress";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/certificate/$skillId")({
  head: () => ({ meta: [{ title: "Certificate of Completion — LEARN MORE" }, { name: "description", content: "Your LEARN MORE skills certificate." }, { property: "og:title", content: "Certificate — LEARN MORE" }, { property: "og:description", content: "Skills Academy certificate of completion." }] }),
  component: CertPage,
});

function CertPage() {
  const { skillId } = Route.useParams();
  const { data: certs = [], isLoading } = useCertificates();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data,
  });
  const cert = certs.find((c) => c.skill_id === skillId);
  if (isLoading) return null;
  if (!cert) return <div className="py-10 text-center">Finish all lessons to earn this certificate. <Link to="/skills/$skillId" params={{ skillId }} className="text-primary">Go to course</Link></div>;
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border-8 border-double border-primary bg-card p-8 text-center">
        <img src={logo} alt="" width={64} height={64} className="mx-auto size-16" />
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-success">LEARN MORE Skills Academy</p>
        <h1 className="mt-4 text-3xl font-extrabold">Certificate of Completion</h1>
        <p className="mt-6 text-muted-foreground">This certifies that</p>
        <p className="mt-2 font-display text-3xl font-extrabold text-primary">{profile?.full_name ?? "Learner"}</p>
        <p className="mt-4 text-muted-foreground">has successfully completed</p>
        <p className="mt-1 text-xl font-bold">{cert.skill_name}</p>
        <p className="mt-6 text-sm text-muted-foreground">Issued {new Date(cert.issued_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })} · ID {cert.id.slice(0, 8).toUpperCase()}</p>
      </div>
      <Button size="xl" className="no-print mt-4 w-full" onClick={() => window.print()}><Printer /> Print or save as PDF</Button>
    </div>
  );
}
