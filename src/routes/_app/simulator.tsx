import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calculator, TrendingDown, PiggyBank, X } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { simulateReduction, simulateFixedSaving, detectRecurring } from "@/lib/insights";
import { formatCurrency } from "@/lib/format";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/_app/simulator")({
  head: () => ({ meta: [{ title: "סימולטור — SmartSpend" }] }),
  component: SimulatorPage,
});

function SimulatorPage() {
  const { expenses, budgets, loading } = useExpenses();
  const [category, setCategory] = useState<string>("all");
  const [reduction, setReduction] = useState([20]);
  const [fixedSave, setFixedSave] = useState("500");
  const [cancelMonthly, setCancelMonthly] = useState("59");

  const result = useMemo(
    () => simulateReduction(expenses, budgets, category, reduction[0]),
    [expenses, budgets, category, reduction]
  );
  const fixed = useMemo(() => simulateFixedSaving(parseFloat(fixedSave) || 0), [fixedSave]);
  const cancel = useMemo(() => simulateFixedSaving(parseFloat(cancelMonthly) || 0), [cancelMonthly]);
  const recurring = useMemo(() => detectRecurring(expenses), [expenses]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
          <Calculator className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">סימולטור "מה יקרה אם?"</h1>
          <p className="mt-1 text-sm text-muted-foreground">בחן תרחישים שונים וראה כמה תוכל לחסוך.</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <EmptyState icon={Calculator} title="עדיין אין נתונים" description="הוסף הוצאות כדי להריץ סימולציות." />
      ) : (
        <Tabs defaultValue="reduce" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reduce">הפחתה בקטגוריה</TabsTrigger>
            <TabsTrigger value="save">יעד חיסכון</TabsTrigger>
            <TabsTrigger value="cancel">ביטול מנויים</TabsTrigger>
          </TabsList>

          <TabsContent value="reduce" className="space-y-4">
            <Card className="border-border/60 p-6 shadow-soft space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>קטגוריה</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">כל ההוצאות</SelectItem>
                      {CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>אחוז הפחתה: {reduction[0]}%</Label>
                  <Slider value={reduction} onValueChange={setReduction} min={5} max={50} step={5} />
                </div>
              </div>
              <ResultBox
                icon={TrendingDown}
                title="חיסכון צפוי"
                primary={formatCurrency(result.monthlySaving)}
                primaryLabel="לחודש"
                secondary={formatCurrency(result.yearlySaving)}
                secondaryLabel="לשנה"
                description={result.description}
              />
            </Card>
          </TabsContent>

          <TabsContent value="save" className="space-y-4">
            <Card className="border-border/60 p-6 shadow-soft space-y-5">
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="save">יעד חיסכון חודשי (₪)</Label>
                <Input id="save" type="number" value={fixedSave} onChange={(e) => setFixedSave(e.target.value)} />
              </div>
              <ResultBox
                icon={PiggyBank}
                title="עוצמת ההרגל"
                primary={formatCurrency(fixed.yearlySaving)}
                primaryLabel="בשנה"
                secondary={formatCurrency(fixed.threeYearSaving)}
                secondaryLabel="ב-3 שנים"
                description={`יעד של ${fixedSave}₪ בחודש מצטבר ל-${formatCurrency(fixed.yearlySaving)} בסוף השנה. אחרי 3 שנים: ${formatCurrency(fixed.threeYearSaving)}.`}
              />
            </Card>
          </TabsContent>

          <TabsContent value="cancel" className="space-y-4">
            <Card className="border-border/60 p-6 shadow-soft space-y-5">
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="cancel">סכום מנוי חודשי (₪)</Label>
                <Input id="cancel" type="number" value={cancelMonthly} onChange={(e) => setCancelMonthly(e.target.value)} />
              </div>
              <ResultBox
                icon={X}
                title="ביטול המנוי שווה"
                primary={formatCurrency(cancel.yearlySaving)}
                primaryLabel="בשנה"
                secondary={formatCurrency(cancel.threeYearSaving)}
                secondaryLabel="ב-3 שנים"
                description={`ביטול מנוי של ${cancelMonthly}₪ בחודש = חיסכון של ${formatCurrency(cancel.yearlySaving)} בשנה.`}
              />

              {recurring.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold mb-3 text-sm">מנויים שזיהינו אצלך:</h4>
                  <div className="space-y-2">
                    {recurring.slice(0, 6).map((r) => {
                      const cat = getCategory(r.category);
                      return (
                        <button
                          key={r.signature}
                          onClick={() => setCancelMonthly(String(r.amount))}
                          className="w-full flex items-center justify-between rounded-lg border border-border p-3 text-right hover:bg-muted/40 transition"
                        >
                          <div>
                            <div className="font-medium text-sm">{r.description || cat.label}</div>
                            <div className="text-xs text-muted-foreground">{cat.label} · חזר ב-{r.monthsSeen} חודשים</div>
                          </div>
                          <div className="text-sm font-semibold">{formatCurrency(r.amount)}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function ResultBox({ icon: Icon, title, primary, primaryLabel, secondary, secondaryLabel, description }: {
  icon: typeof Calculator; title: string; primary: string; primaryLabel: string; secondary: string; secondaryLabel: string; description: string;
}) {
  return (
    <div className="rounded-2xl bg-gradient-card border border-success/20 p-6">
      <div className="flex items-center gap-2 text-success">
        <Icon className="h-5 w-5" />
        <span className="font-semibold">{title}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-3xl font-bold tracking-tight text-success">{primary}</div>
          <div className="text-xs text-muted-foreground mt-1">{primaryLabel}</div>
        </div>
        <div>
          <div className="text-3xl font-bold tracking-tight">{secondary}</div>
          <div className="text-xs text-muted-foreground mt-1">{secondaryLabel}</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
