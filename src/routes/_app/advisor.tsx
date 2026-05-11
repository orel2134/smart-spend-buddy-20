import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/StatCard";
import { Users, AlertTriangle, Target, MessageSquare, Bell, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { DEMO_CLIENTS, statusOf, riskReason, recommendedAction } from "@/lib/advisor-demo";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/advisor")({
  head: () => ({ meta: [{ title: "דשבורד יועץ — SmartSpend" }] }),
  component: AdvisorDashboard,
});

function AdvisorDashboard() {
  const clients = DEMO_CLIENTS;
  const totalClients = clients.length;
  const atRisk = clients.filter((c) => c.currentSpending / c.monthlyBudget > 0.85).length;
  const avgUsage = Math.round(clients.reduce((s, c) => s + (c.currentSpending / c.monthlyBudget), 0) / totalClients * 100);
  const critical = clients.filter((c) => c.currentSpending > c.monthlyBudget).length;

  const radar = clients
    .map((c) => ({ c, status: statusOf(c) }))
    .filter((x) => x.status.tone !== "good")
    .sort((a, b) => (b.c.currentSpending / b.c.monthlyBudget) - (a.c.currentSpending / a.c.monthlyBudget));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">דשבורד יועץ</h1>
          <p className="mt-1 text-sm text-muted-foreground">תמונת מצב כוללת של כל הלקוחות שלך</p>
        </div>
        <Button asChild className="bg-gradient-primary shadow-soft gap-2">
          <Link to="/advisor/invitations">+ הזמן לקוח חדש</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="סך הלקוחות" value={String(totalClients)} icon={Users} trend="מחוברים פעילים" />
        <StatCard label="לקוחות בסיכון" value={String(atRisk)} icon={AlertTriangle} trend={critical > 0 ? `${critical} בחריגה` : "מעקב נדרש"} trendType={atRisk > 0 ? "warn" : "neutral"} />
        <StatCard label="ניצול תקציב ממוצע" value={`${avgUsage}%`} icon={Target} trend="ממוצע על פני הלקוחות" />
        <StatCard label="המלצות ממתינות" value="3" icon={MessageSquare} trend="לשלוח השבוע" />
      </div>

      {/* Risk radar */}
      <Card className="border-border/60 bg-gradient-card p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-warning" />
            <h2 className="text-xl font-bold">מכ״ם סיכון לקוחות</h2>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1">
            <Link to="/advisor/risk-radar">לתצוגה המלאה <ArrowLeft className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {radar.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">כל הלקוחות במצב תקין כרגע 🎉</p>}
          {radar.slice(0, 3).map(({ c, status }) => (
            <Link key={c.id} to="/advisor/client/$id" params={{ id: c.id }}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-soft">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{c.fullName}</span>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    status.tone === "critical" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"
                  )}>{status.label}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{riskReason(c)}</p>
                <p className="mt-1 text-xs text-primary">המלצה: {recommendedAction(c)}</p>
              </div>
              <div className="text-left shrink-0">
                <div className="text-sm font-bold">{formatCurrency(c.currentSpending)}</div>
                <div className="text-[11px] text-muted-foreground">מתוך {formatCurrency(c.monthlyBudget)}</div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Top clients quick view */}
      <Card className="border-border/60 p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">סקירת לקוחות</h2>
          <Button asChild variant="ghost" size="sm"><Link to="/advisor/clients">לכל הלקוחות</Link></Button>
        </div>
        <div className="space-y-3">
          {clients.map((c) => {
            const usage = (c.currentSpending / c.monthlyBudget) * 100;
            const status = statusOf(c);
            return (
              <Link key={c.id} to="/advisor/client/$id" params={{ id: c.id }} className="block rounded-lg border border-border p-4 hover:shadow-soft transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{c.fullName}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {c.trend > 0 ? <TrendingUp className="h-3.5 w-3.5 text-destructive" /> : <TrendingDown className="h-3.5 w-3.5 text-success" />}
                    <span className={c.trend > 0 ? "text-destructive" : "text-success"}>{c.trend > 0 ? "+" : ""}{c.trend}%</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{formatCurrency(c.currentSpending)} / {formatCurrency(c.monthlyBudget)}</span>
                    <span className={cn("font-medium",
                      status.tone === "critical" ? "text-destructive" : status.tone === "warning" ? "text-warning" : "text-success"
                    )}>{Math.round(usage)}%</span>
                  </div>
                  <Progress value={Math.min(100, usage)} className={cn(
                    status.tone === "critical" ? "[&>div]:bg-destructive" : status.tone === "warning" ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                  )} />
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
