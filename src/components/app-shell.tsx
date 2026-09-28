import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, GraduationCap, Home, LayoutDashboard, LogOut, MessageCircle, PenLine, Video, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/practice", label: "Practice", icon: PenLine },
  { to: "/tutor", label: "AI Tutor", icon: MessageCircle },
  { to: "/classes", label: "Classes", icon: Video },
  { to: "/notes", label: "Notes", icon: BookOpen },
  { to: "/skills", label: "Skills", icon: Wrench },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="no-print sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="" width={32} height={32} className="size-8" />
            <span className="font-display text-lg font-extrabold tracking-tight">
              LEARN <span className="text-success">MORE</span>
            </span>
          </Link>
          <nav className="ml-6 hidden gap-1 md:flex">
            {NAV.slice(1).map((n) => (
              <Link key={n.to} to={n.to} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" activeProps={{ className: "bg-primary-soft !text-primary" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            {user ? (
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out"><LogOut /></Button>
            ) : (
              <Button asChild size="sm"><Link to="/auth">Sign in</Link></Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5">{children}</main>
      <nav className="no-print fixed inset-x-0 bottom-0 z-30 grid grid-cols-7 border-t bg-card md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold text-muted-foreground" activeProps={{ className: "!text-primary" }}>
            <n.icon className="size-5" />
            {n.label === "Dashboard" ? "Me" : n.label.replace("AI ", "")}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageTitle({ title, sub, icon: Icon = GraduationCap }: { title: string; sub?: string; icon?: typeof GraduationCap }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="size-5" /></div>
      <div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
