import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChevronLeft, Headphones, Lock, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BOOKS, BOOK_UNLOCK_ID, BOOK_PRICE, BOOK_ACCOUNT, type Book } from "@/lib/data/books";
import { speak, speechSupported, stopSpeaking } from "@/lib/speak";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/books")({
  head: () => ({
    meta: [
      { title: "Business books library — LEARN MORE" },
      { name: "description", content: "20 business books as voice notes — listen to the lessons that build wealth." },
      { property: "og:title", content: "Business books library — LEARN MORE" },
      { property: "og:description", content: "Listen to 20 business books. 5 free, unlock all 20 for ₦2,000." },
    ],
  }),
  component: Books,
});

function Books() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { data: unlock } = useQuery({
    queryKey: ["skill_unlock", BOOK_UNLOCK_ID],
    queryFn: async () => (await supabase.from("skill_unlocks").select("status").eq("skill_id", BOOK_UNLOCK_ID).maybeSingle()).data,
  });
  const unlocked = unlock?.status === "approved";

  useEffect(() => () => stopSpeaking(), []);

  const listen = (b: Book) => {
    if (playingId === b.id) {
      stopSpeaking();
      setPlayingId(null);
      return;
    }
    if (!speechSupported()) {
      toast.error("This phone can't play voice notes — read the summary instead.");
      return;
    }
    const text = `${b.title}, by ${b.author}. ${b.summary}`;
    const ok = speak(text, () => setPlayingId((p) => (p === b.id ? null : p)));
    if (!ok) return toast.error("This phone can't play voice notes — read the summary instead.");
    setPlayingId(b.id);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/" className="mb-3 inline-flex items-center text-sm font-semibold text-primary"><ChevronLeft className="size-4" /> Home</Link>
      <PageTitle title="Business books library" sub="20 books · listen as voice notes · build the mindset that makes money." />
      {!unlocked && <PayCard status={unlock?.status} />}
      <div className="space-y-2">
        {BOOKS.map((b, i) => {
          const locked = b.premium && !unlocked;
          const open = openId === b.id && !locked;
          return (
            <div key={b.id} className={`rounded-2xl border bg-card ${open ? "border-primary" : ""}`}>
              <button
                onClick={() => (locked ? undefined : setOpenId(open ? null : b.id))}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <div className={`grid size-10 shrink-0 place-items-center rounded-xl font-extrabold ${locked ? "bg-muted text-muted-foreground" : "bg-primary-soft text-primary"}`}>
                  {locked ? <Lock className="size-5" /> : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.author} · ~{b.minutes} min listen</p>
                </div>
                <Headphones className={`size-5 shrink-0 ${locked ? "text-muted-foreground" : "text-success"}`} />
              </button>
              {open && (
                <div className="border-t p-4">
                  <Button onClick={() => listen(b)} size="lg" variant={playingId === b.id ? "secondary" : "default"} className="w-full">
                    {playingId === b.id ? <><Square /> Stop</> : <><Play /> Listen to this book</>}
                  </Button>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.summary}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Listen to one book a week — by the end of the term you'll think like a business owner.</p>
    </div>
  );
}

function PayCard({ status }: { status?: string }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const send = async () => {
    if (!name.trim()) return toast.error("Type the name on the account you paid from.");
    const { error } = await supabase.from("skill_unlocks").insert({ skill_id: BOOK_UNLOCK_ID, payer_name: name.trim() });
    if (error) return toast.error("Couldn't send. Try again.");
    toast.success("Thanks! We'll unlock the books once we confirm your payment.");
    qc.invalidateQueries({ queryKey: ["skill_unlock", BOOK_UNLOCK_ID] });
  };
  return (
    <div className="mb-4 rounded-2xl border-2 border-primary bg-primary-soft p-4">
      <p className="flex items-center gap-2 font-bold"><Lock className="size-5" /> Unlock all {BOOKS.filter((b) => b.premium).length} premium books — ₦{BOOK_PRICE.toLocaleString()}</p>
      <p className="mt-1 text-sm">Pay once, listen forever. Transfer to:</p>
      <p className="text-xl font-extrabold">{BOOK_ACCOUNT.number}</p>
      <p className="text-sm font-semibold">{BOOK_ACCOUNT.bank} · {BOOK_ACCOUNT.name}</p>
      {status === "pending" ? (
        <p className="mt-3 text-sm font-semibold">Payment sent — waiting for confirmation.</p>
      ) : (
        <div className="mt-3 space-y-2">
          <Input placeholder="Name on the account you paid from" value={name} onChange={(e) => setName(e.target.value)} className="h-12 bg-background" />
          <Button size="lg" className="w-full" onClick={send}>I have paid</Button>
        </div>
      )}
    </div>
  );
}
