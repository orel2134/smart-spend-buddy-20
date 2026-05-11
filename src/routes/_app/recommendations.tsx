import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/recommendations")({
  head: () => ({ meta: [{ title: "המלצות יועץ — SmartSpend" }] }),
  component: RecsPage,
});

interface Rec { id: string; title: string; message: string; priority: string; status: string; created_at: string; category: string | null; }

function RecsPage() {
  const { user } = useAuth();
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("recommendations").select("*").eq("client_id", user.id).order("created_at", { ascending: false });
    setRecs((data ?? []) as Rec[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const markDone = async (id: string) => {
    await supabase.from("recommendations").update({ status: "done" }).eq("id", id);
    toast.success("סומן כבוצע");
    load();
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">המלצות מהיועץ שלך</h1>
        <p className="mt-1 text-sm text-muted-foreground">המלצות אישיות שנשלחו אליך</p>
      </div>

      {recs.length === 0 ? (
        <EmptyState icon={MessageSquare} title="אין המלצות עדיין" description="כשהיועץ שלך ישלח לך המלצה היא תופיע כאן." />
      ) : (
        <div className="space-y-3">
          {recs.map((r) => (
            <Card key={r.id} className={cn("border-border/60 p-5 shadow-soft border-r-4",
              r.priority === "high" ? "border-r-destructive" : r.priority === "medium" ? "border-r-warning" : "border-r-primary"
            )}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg">{r.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{r.message}</p>
                  <div className="mt-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("he-IL")}</div>
                </div>
                {r.status !== "done" && (
                  <Button size="sm" variant="outline" onClick={() => markDone(r.id)} className="gap-1">
                    <Check className="h-4 w-4" /> סמן כבוצע
                  </Button>
                )}
                {r.status === "done" && <span className="rounded-full bg-success/15 text-success px-2 py-0.5 text-xs font-medium">בוצע</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
