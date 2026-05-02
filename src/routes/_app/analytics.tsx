import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { byCategory, dailyTrend, lastMonthsTrend, filterByMonth, budgetUsage } from "@/lib/insights";
import { formatCurrency } from "@/lib/format";
import { getCategory } from "@/lib/categories";
import { EmptyState } from "@/components/EmptyState";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "ניתוחים — SmartSpend" }] }),
  component: AnalyticsPage,
});

type Range = "month" | "last_month" | "3_months" | "6_months";

function AnalyticsPage() {
  const { expenses, budgets, loading } = useExpenses();
  const [range, setRange] = useState<Range>("month");

  const filtered = (() => {
    const now = new Date();
    if (range === "month") return filterByMonth(expenses);
    if (range === "last_month") {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return filterByMonth(expenses, d);
    }
    const months = range === "3_months" ? 3 : 6;
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, 1);
    return expenses.filter((e) => new Date(e.expense_date) >= cutoff);
  })();

  const catData = byCategory(filtered);
  const trend6 = lastMonthsTrend(expenses, 6);
  const monthly = dailyTrend(filtered);
  const usage = budgetUsage(budgets, filterByMonth(expenses));

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ניתוחים</h1>
          <p className="mt-1 text-sm text-muted-foreground">תצוגות ויזואליות מתקדמות של ההוצאות שלך.</p>
        </div>
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList>
            <TabsTrigger value="month">החודש</TabsTrigger>
            <TabsTrigger value="last_month">חודש שעבר</TabsTrigger>
            <TabsTrigger value="3_months">3 חודשים</TabsTrigger>
            <TabsTrigger value="6_months">6 חודשים</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {expenses.length === 0 ? (
        <EmptyState icon={BarChart3} title="אין נתונים להציג" description="הוסף הוצאות כדי לראות גרפים וניתוחים." />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/60 p-6 shadow-soft">
              <h3 className="font-semibold">פילוח לפי קטגוריה</h3>
              <div className="mt-4 h-72">
                {catData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">אין הוצאות בטווח זה</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={catData} dataKey="amount" nameKey="label" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
                        {catData.map((c) => <Cell key={c.category} fill={c.color} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.012 250)", direction: "rtl" }}
                        formatter={(v: number, n) => [formatCurrency(v), n]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="border-border/60 p-6 shadow-soft">
              <h3 className="font-semibold">השוואה לפי חודשים</h3>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend6}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 250)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.012 250)", direction: "rtl" }} formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="amount" fill="oklch(0.55 0.18 255)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="border-border/60 p-6 shadow-soft">
            <h3 className="font-semibold">מגמת הוצאות יומית</h3>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 250)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.012 250)", direction: "rtl" }} formatter={(v: number) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="amount" stroke="oklch(0.65 0.15 155)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {usage.length > 0 && (
            <Card className="border-border/60 p-6 shadow-soft">
              <h3 className="font-semibold">ניצול תקציב לפי קטגוריות</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usage.map((u) => ({ name: u.label, ניצול: u.spent, תקציב: u.budget }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 250)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.012 250)", direction: "rtl" }} formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="תקציב" fill="oklch(0.92 0.012 250)" radius={[0, 8, 8, 0]} />
                    <Bar dataKey="ניצול" fill="oklch(0.55 0.18 255)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

void getCategory; // keep import used in case of future expansion
