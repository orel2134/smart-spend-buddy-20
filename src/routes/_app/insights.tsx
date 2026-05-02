import { createFileRoute } from "@tanstack/react-router";
import { useExpenses } from "@/hooks/useExpenses";
import { Card } from "@/components/ui/card";
import { Lightbulb, Sparkles } from "lucide-react";
import { generateInsights, recommendations, budgetUsage, filterByMonth } from "@/lib/insights";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/insights")({
  head: () => ({ meta: [{ title: "תובנות — SmartSpend" }] }),
  component: InsightsPage,
});

function InsightsPage() {
  const { expenses, budgets, loading } = useExpenses();
  const insights = generateInsights(expenses, budgets);
  const usage = budgetUsage(budgets, filterByMonth(expenses));
  const recs = recommendations(insights, usage);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">תובנות חכמות</h1>
        <p className="mt-1 text-sm text-muted-foreground">SmartSpend מנתח עבורך את ההוצאות ומספק תובנות אישיות.</p>
      </div>

      {expenses.length === 0 ? (
        <EmptyState icon={Lightbulb} title="עוד אין מספיק נתונים" description="הוסף הוצאות כדי לקבל תובנות חכמות מותאמות אישית." />
      ) : (
        <>
          <div>
            <h2 className="mb-3 text-lg font-semibold">מה זיהינו</h2>
            {insights.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">הכל נראה תקין החודש 👌</Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {insights.map((i) => (
                  <Card
                    key={i.id}
                    className={cn(
                      "border p-5 shadow-soft",
                      i.severity === "critical" && "border-destructive/30 bg-destructive/5",
                      i.severity === "warning" && "border-warning/30 bg-warning/5",
                      i.severity === "success" && "border-success/30 bg-success/5",
                      i.severity === "info" && "border-border bg-card"
                    )}
                  >
                    <div className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg",
                      i.severity === "critical" && "bg-destructive/15 text-destructive",
                      i.severity === "warning" && "bg-warning/15 text-warning",
                      i.severity === "success" && "bg-success/15 text-success",
                      i.severity === "info" && "bg-primary/10 text-primary"
                    )}>
                      <Lightbulb className="h-4 w-4" />
                    </div>
                    <div className="mt-3 font-semibold">{i.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{i.description}</div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> המלצות אישיות
            </h2>
            <Card className="border-border/60 bg-gradient-card p-6 shadow-soft">
              <ul className="space-y-3">
                {recs.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground shadow-soft">{i + 1}</div>
                    <span className="text-sm">{r}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
