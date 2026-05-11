import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { DEMO_CLIENTS, statusOf, riskReason, recommendedAction } from "@/lib/advisor-demo";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Radar } from "lucide-react";

export const Route = createFileRoute("/_app/advisor/risk-radar")({
  head: () => ({ meta: [{ title: "מכ״ם סיכון — SmartSpend" }] }),
  component: RiskRadarPage,
});

function RiskRadarPage() {
  const ranked = [...DEMO_CLIENTS]
    .map((c) => ({ c, status: statusOf(c) }))
    .sort((a, b) => (b.c.currentSpending / b.c.monthlyBudget) - (a.c.currentSpending / a.c.monthlyBudget));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
          <Radar className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">מכ״ם סיכון לקוחות</h1>
          <p className="mt-1 text-sm text-muted-foreground">מי בסיכון לחריגה השבוע — מסודר לפי דחיפות</p>
        </div>
      </div>

      <div className="space-y-3">
        {ranked.map(({ c, status }) => (
          <Card key={c.id} className={cn("border-border/60 p-5 shadow-soft border-r-4",
            status.tone === "critical" ? "border-r-destructive" : status.tone === "warning" ? "border-r-warning" : "border-r-success"
          )}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <Link to="/advisor/client/$id" params={{ id: c.id }} className="text-lg font-bold hover:text-primary">{c.fullName}</Link>
                <p className="mt-1 text-sm">{riskReason(c)}</p>
                <p className="mt-2 text-sm text-primary"><strong>פעולה מומלצת:</strong> {recommendedAction(c)}</p>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold">{Math.round((c.currentSpending / c.monthlyBudget) * 100)}%</div>
                <div className="text-xs text-muted-foreground">{formatCurrency(c.currentSpending)} / {formatCurrency(c.monthlyBudget)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
