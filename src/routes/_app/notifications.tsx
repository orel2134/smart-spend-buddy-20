import { createFileRoute } from "@tanstack/react-router";
import { useExpenses } from "@/hooks/useExpenses";
import { Card } from "@/components/ui/card";
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { generateInsights } from "@/lib/insights";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "התראות — SmartSpend" }] }),
  component: NotificationsPage,
});

const ICONS = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

function NotificationsPage() {
  const { expenses, budgets, loading } = useExpenses();
  const items = generateInsights(expenses, budgets);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">התראות</h1>
        <p className="mt-1 text-sm text-muted-foreground">התראות חכמות בזמן אמת על חריגות, מגמות וטיפים.</p>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="אין התראות חדשות" description="כל המערכות תקינות. נמשיך לעקוב אחר ההוצאות שלך." />
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const Icon = ICONS[n.severity];
            return (
              <Card
                key={n.id}
                className={cn(
                  "flex items-start gap-4 border p-4 shadow-soft",
                  n.severity === "critical" && "border-destructive/30 bg-destructive/5",
                  n.severity === "warning" && "border-warning/30 bg-warning/5",
                  n.severity === "success" && "border-success/30 bg-success/5",
                  n.severity === "info" && "border-border"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  n.severity === "critical" && "bg-destructive/15 text-destructive",
                  n.severity === "warning" && "bg-warning/15 text-warning",
                  n.severity === "success" && "bg-success/15 text-success",
                  n.severity === "info" && "bg-primary/10 text-primary"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{n.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{n.description}</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
