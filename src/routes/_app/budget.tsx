import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Target } from "lucide-react";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";
import { filterByMonth, budgetUsage } from "@/lib/insights";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_app/budget")({
  head: () => ({ meta: [{ title: "תקציב — SmartSpend" }] }),
  component: BudgetPage,
});

function BudgetPage() {
  const { user } = useAuth();
  const { expenses, budgets, loading, refresh } = useExpenses();
  const [category, setCategory] = useState<string>("__total__");
  const [amount, setAmount] = useState("");

  const monthExpenses = filterByMonth(expenses);
  const usage = budgetUsage(budgets, monthExpenses);

  const handleAdd = async () => {
    if (!user) return;
    const num = parseFloat(amount);
    if (!num || num <= 0) { toast.error("הזן סכום חוקי"); return; }
    const cat = category === "__total__" ? null : category;
    const { error } = await supabase.from("budgets").upsert(
      { user_id: user.id, category: cat, amount: num, period: "monthly" },
      { onConflict: "user_id,category,period" }
    );
    if (error) { toast.error("שמירה נכשלה", { description: error.message }); return; }
    toast.success("התקציב עודכן");
    setAmount("");
    refresh();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) { toast.error("מחיקה נכשלה"); return; }
    toast.success("התקציב הוסר");
    refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">תקציב</h1>
        <p className="mt-1 text-sm text-muted-foreground">הגדר תקציבים חודשיים וקבל התראות חכמות לפני חריגה.</p>
      </div>

      <Card className="border-border/60 p-6 shadow-soft">
        <h3 className="font-semibold">הגדרת תקציב חדש</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>קטגוריה</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__total__">תקציב כללי</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>סכום חודשי (₪)</Label>
            <Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1500" />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAdd} className="w-full bg-gradient-primary gap-2"><Plus className="h-4 w-4" /> שמור תקציב</Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : budgets.length === 0 ? (
        <EmptyState icon={Target} title="עדיין לא הגדרת תקציבים" description="התחל בתקציב כללי או הגדר לפי קטגוריות." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {usage.map((u) => {
            const budget = budgets.find((b) => (b.category ?? null) === u.category);
            const cat = u.category ? getCategory(u.category) : null;
            const Icon = cat?.icon ?? Target;
            return (
              <Card key={u.category ?? "total"} className="border-border/60 p-5 shadow-soft">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold">{u.label}</div>
                      <div className="text-xs text-muted-foreground">חודשי</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => budget && handleDelete(budget.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold">{formatCurrency(u.spent)}</div>
                    <div className="text-sm text-muted-foreground">/ {formatCurrency(u.budget)}</div>
                  </div>
                  <Progress
                    value={Math.min(u.percent, 100)}
                    className={"mt-3 " + (
                      u.status === "critical" ? "[&>div]:bg-destructive" :
                      u.status === "warning" ? "[&>div]:bg-warning" :
                      "[&>div]:bg-success"
                    )}
                  />
                  <div className="mt-2 flex justify-between text-xs">
                    <span className={
                      u.status === "critical" ? "text-destructive font-medium" :
                      u.status === "warning" ? "text-warning font-medium" :
                      "text-success font-medium"
                    }>{u.percent}% נוצלו</span>
                    <span className="text-muted-foreground">
                      {u.budget - u.spent > 0 ? `נותרו ${formatCurrency(u.budget - u.spent)}` : `חריגה: ${formatCurrency(u.spent - u.budget)}`}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
