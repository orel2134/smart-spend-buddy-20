import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Flame, CheckCircle2, XCircle } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { generateChallenges } from "@/lib/insights";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/challenges")({
  head: () => ({ meta: [{ title: "אתגרים — SmartSpend" }] }),
  component: ChallengesPage,
});

function ChallengesPage() {
  const { expenses, budgets, loading } = useExpenses();
  const challenges = generateChallenges(expenses, budgets);
  const completed = challenges.filter((c) => c.status === "completed").length;
  const active = challenges.filter((c) => c.status === "active").length;

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
          <Trophy className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">אתגרי חיסכון</h1>
          <p className="mt-1 text-sm text-muted-foreground">צבור הישגים ובנה הרגלים פיננסיים בריאים.</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <EmptyState icon={Trophy} title="אתגרים יופיעו בקרוב" description="הוסף הוצאות והתחל לאסוף הישגים!" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-success/30 bg-gradient-card p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{completed}</div>
                  <div className="text-xs text-muted-foreground">אתגרים הושלמו</div>
                </div>
              </div>
            </Card>
            <Card className="border-primary/30 bg-gradient-card p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{active}</div>
                  <div className="text-xs text-muted-foreground">אתגרים פעילים</div>
                </div>
              </div>
            </Card>
            <Card className="border-warning/30 bg-gradient-card p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15">
                  <Target className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{challenges.length}</div>
                  <div className="text-xs text-muted-foreground">סך הכול אתגרים</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {challenges.map((c) => (
              <Card key={c.id} className={cn(
                "border p-5 shadow-soft transition-all hover:shadow-elegant",
                c.status === "completed" && "border-success/40 bg-success/5",
                c.status === "failed" && "border-destructive/40 bg-destructive/5",
                c.status === "active" && "border-border/60 bg-gradient-card",
              )}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{c.title}</h3>
                      {c.status === "completed" && <Badge className="bg-success text-success-foreground">הושלם</Badge>}
                      {c.status === "failed" && <Badge variant="destructive">נכשל</Badge>}
                      {c.status === "active" && <Badge variant="secondary">פעיל</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  {c.status === "completed" ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
                  ) : c.status === "failed" ? (
                    <XCircle className="h-6 w-6 shrink-0 text-destructive" />
                  ) : (
                    <Flame className="h-6 w-6 shrink-0 text-primary" />
                  )}
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{c.detail}</span>
                    <span className="font-medium">{Math.round(c.progress)}%</span>
                  </div>
                  <Progress value={c.progress} className={cn(
                    c.status === "completed" && "[&>div]:bg-success",
                    c.status === "failed" && "[&>div]:bg-destructive",
                    c.status === "active" && "[&>div]:bg-gradient-primary",
                  )} />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
