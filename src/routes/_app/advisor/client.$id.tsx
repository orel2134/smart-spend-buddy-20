import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_CLIENTS, statusOf, riskReason } from "@/lib/advisor-demo";
import { formatCurrency } from "@/lib/format";
import { ArrowRight, MessageSquare, StickyNote } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/advisor/client/$id")({
  head: () => ({ meta: [{ title: "פרופיל לקוח — SmartSpend" }] }),
  component: ClientProfile,
});

function ClientProfile() {
  const { id } = Route.useParams();
  const client = DEMO_CLIENTS.find((c) => c.id === id);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([
    "הלקוח מעוניין להפחית הוצאות מסעדות.",
  ]);

  if (!client) throw notFound();
  const s = statusOf(client);
  const usage = Math.round((client.currentSpending / client.monthlyBudget) * 100);

  const addNote = () => {
    if (!note.trim()) return;
    setNotes([note, ...notes]);
    setNote("");
    toast.success("ההערה נשמרה");
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1"><Link to="/advisor/clients"><ArrowRight className="h-4 w-4" /> חזרה לרשימת לקוחות</Link></Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">{client.fullName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{client.email}</p>
        </div>
        <Button asChild className="bg-gradient-primary shadow-soft gap-2">
          <Link to="/advisor/recommendations" search={{ clientId: client.id }}><MessageSquare className="h-4 w-4" /> שלח המלצה</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-gradient-card p-5 shadow-soft">
          <div className="text-xs text-muted-foreground">ניצול תקציב</div>
          <div className="mt-2 text-3xl font-bold">{usage}%</div>
          <Progress value={Math.min(100, usage)} className={cn("mt-3",
            s.tone === "critical" ? "[&>div]:bg-destructive" : s.tone === "warning" ? "[&>div]:bg-warning" : "[&>div]:bg-success"
          )} />
          <div className="mt-2 text-xs text-muted-foreground">{formatCurrency(client.currentSpending)} מתוך {formatCurrency(client.monthlyBudget)}</div>
        </Card>
        <Card className="border-border/60 bg-gradient-card p-5 shadow-soft">
          <div className="text-xs text-muted-foreground">ציון בריאות פיננסית</div>
          <div className="mt-2 text-3xl font-bold">{client.healthScore}<span className="text-lg text-muted-foreground">/100</span></div>
          <div className="mt-3 text-sm">{riskReason(client)}</div>
        </Card>
        <Card className="border-border/60 bg-gradient-card p-5 shadow-soft">
          <div className="text-xs text-muted-foreground">פעילות אחרונה</div>
          <div className="mt-2 text-lg font-semibold">{client.lastActivity}</div>
          <div className="mt-3 text-sm text-muted-foreground">קטגוריה מובילה: {client.topCategory}</div>
        </Card>
      </div>

      <Card className="border-border/60 p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <StickyNote className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">הערות פנימיות</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">הערות אלה גלויות רק לך — הלקוח לא יכול לראות אותן.</p>
        <div className="flex gap-2">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="הוסף הערה..." rows={2} />
          <Button onClick={addNote}>הוסף</Button>
        </div>
        <div className="mt-4 space-y-2">
          {notes.map((n, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 text-sm">{n}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}
