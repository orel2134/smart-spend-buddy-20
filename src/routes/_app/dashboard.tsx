import { createFileRoute, Link } from "@tanstack/react-router";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingDown, PieChart as PieIcon, AlertCircle, Receipt, Plus, ArrowLeft } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  filterByMonth, filterPrevMonth, sumAmount, biggestCategory,
  monthOverMonthChange, dailyTrend, budgetUsage, generateInsights,
  forecastMonth, financialHealthScore,
} from "@/lib/insights";
import { ForecastCard } from "@/components/ForecastCard";
import { HealthScoreCard } from "@/components/HealthScoreCard";
import { formatCurrency, formatMonth } from "@/lib/format";
import { getCategory } from "@/lib/categories";
import { useState } from "react";
import { ExpenseDialog } from "@/components/ExpenseDialog";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "דשבורד — SmartSpend" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const { expenses, budgets, loading, refresh } = useExpenses();
  const [open, setOpen] = useState(false);

  const current = filterByMonth(expenses);
  const prev = filterPrevMonth(expenses);
  const currentTotal = sumAmount(current);
  const prevTotal = sumAmount(prev);
  const change = monthOverMonthChange(currentTotal, prevTotal);
  const totalBudget = budgets.find((b) => !b.category)?.amount ?? 0;
  const remaining = Math.max(0, Number(totalBudget) - currentTotal);
  const big = biggestCategory(current);
  const insights = generateInsights(expenses, budgets);
  const usage = budgetUsage(budgets, current);
  const trend = dailyTrend(current).map((d) => ({ ...d, cumulative: 0 }));
  let acc = 0;
  trend.forEach((t) => { acc += t.amount; t.cumulative = acc; });

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">שלום, {user?.user_metadata?.full_name?.split(" ")[0] ?? "חבר"} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatMonth(new Date())} · תמונת מצב פיננסית</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-gradient-primary shadow-soft gap-2">
          <Plus className="h-4 w-4" /> הוצאה חדשה
        </Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="בוא נתחיל!"
          description="הוסף את ההוצאה הראשונה שלך וקבל תובנות חכמות על ההתנהלות הפיננסית שלך."
          action={<Button onClick={() => setOpen(true)} className="bg-gradient-primary gap-2"><Plus className="h-4 w-4" /> הוסף הוצאה ראשונה</Button>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="הוצאות החודש"
              value={formatCurrency(currentTotal)}
              trend={prevTotal > 0 ? `${change >= 0 ? "+" : ""}${change}% מהחודש שעבר` : "החודש הראשון"}
              trendType={change > 0 ? "up" : change < 0 ? "down" : "neutral"}
              icon={Wallet}
            />
            <StatCard
              label="נותר בתקציב"
              value={totalBudget > 0 ? formatCurrency(remaining) : "—"}
              trend={totalBudget > 0 ? `מתוך ${formatCurrency(Number(totalBudget))}` : "הגדר תקציב"}
              trendType={remaining > 0 ? "down" : "up"}
              icon={TrendingDown}
              iconBg="bg-gradient-success"
            />
            <StatCard
              label="קטגוריה מובילה"
              value={big ? big.label : "—"}
              trend={big ? formatCurrency(big.amount) : "אין נתונים"}
              icon={PieIcon}
              iconBg="bg-warning"
            />
            <StatCard
              label="התראות"
              value={`${insights.length}`}
              trend={insights.length > 0 ? insights[0].title : "הכל תקין"}
              trendType={insights.some((i) => i.severity === "critical") ? "up" : insights.some((i) => i.severity === "warning") ? "warn" : "down"}
              icon={AlertCircle}
              iconBg={insights.some((i) => i.severity === "critical") ? "bg-destructive" : "bg-gradient-primary"}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-border/60 p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">מגמת הוצאות חודשית</h3>
                  <p className="text-xs text-muted-foreground">סך הוצאות מצטבר לפי יום</p>
                </div>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.55 0.18 255)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="oklch(0.55 0.18 255)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 250)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.03 255)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.5 0.03 255)" />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.012 250)", direction: "rtl" }}
                      formatter={(v: number) => [formatCurrency(v), "סך מצטבר"]}
                      labelFormatter={(l) => `יום ${l}`}
                    />
                    <Line type="monotone" dataKey="cumulative" stroke="oklch(0.55 0.18 255)" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="border-border/60 p-6 shadow-soft">
              <h3 className="font-semibold">תקציבים</h3>
              <p className="text-xs text-muted-foreground">ניצול חודשי</p>
              {usage.length === 0 ? (
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  עדיין לא הגדרת תקציבים
                  <Button asChild variant="link" className="block mx-auto mt-2"><Link to="/budget">הגדר עכשיו</Link></Button>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {usage.slice(0, 5).map((u) => (
                    <div key={u.category ?? "total"}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="font-medium">{u.label}</span>
                        <span className={
                          u.status === "critical" ? "text-destructive font-medium" :
                          u.status === "warning" ? "text-warning font-medium" :
                          "text-muted-foreground"
                        }>{u.percent}%</span>
                      </div>
                      <Progress value={Math.min(u.percent, 100)} className={
                        u.status === "critical" ? "[&>div]:bg-destructive" :
                        u.status === "warning" ? "[&>div]:bg-warning" :
                        "[&>div]:bg-success"
                      } />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {insights.length > 0 && (
            <Card className="border-border/60 p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">תובנות חכמות</h3>
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <Link to="/insights">לכל התובנות <ArrowLeft className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {insights.slice(0, 4).map((i) => (
                  <div key={i.id} className={
                    "rounded-xl border p-4 " +
                    (i.severity === "critical" ? "border-destructive/30 bg-destructive/5" :
                     i.severity === "warning" ? "border-warning/30 bg-warning/5" :
                     i.severity === "success" ? "border-success/30 bg-success/5" :
                     "border-border bg-muted/30")
                  }>
                    <div className="text-sm font-semibold">{i.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{i.description}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="border-border/60 p-6 shadow-soft">
            <h3 className="font-semibold">הוצאות אחרונות</h3>
            <div className="mt-4 divide-y divide-border">
              {expenses.slice(0, 6).map((e) => {
                const cat = getCategory(e.category);
                const Icon = cat.icon;
                return (
                  <div key={e.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${cat.color}/15`, background: `color-mix(in oklab, ${cat.color} 15%, transparent)` }}>
                        <Icon className="h-5 w-5" style={{ color: cat.color }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{e.description || cat.label}</div>
                        <div className="text-xs text-muted-foreground">{cat.label} · {new Date(e.expense_date).toLocaleDateString("he-IL")}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{formatCurrency(Number(e.amount))}</div>
                  </div>
                );
              })}
            </div>
            <Button asChild variant="ghost" className="mt-4 w-full gap-1">
              <Link to="/expenses">לכל ההוצאות <ArrowLeft className="h-3.5 w-3.5" /></Link>
            </Button>
          </Card>
        </>
      )}

      <ExpenseDialog open={open} onOpenChange={setOpen} onSaved={refresh} />
    </div>
  );
}
