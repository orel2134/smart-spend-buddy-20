import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEMO_CLIENTS } from "@/lib/advisor-demo";
import { FileBarChart, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/advisor/reports")({
  head: () => ({ meta: [{ title: "דוחות — SmartSpend" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const total = DEMO_CLIENTS.length;
  const improved = DEMO_CLIENTS.filter((c) => c.trend < 0).length;
  const worsened = DEMO_CLIENTS.filter((c) => c.trend > 10).length;
  const avgUsage = Math.round(DEMO_CLIENTS.reduce((s, c) => s + c.currentSpending / c.monthlyBudget, 0) / total * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">דוחות</h1>
          <p className="mt-1 text-sm text-muted-foreground">סיכום ביצועי הלקוחות שלך</p>
        </div>
        <Button onClick={() => toast.success("הדוח יוצא בהצלחה")} className="gap-2">
          <Download className="h-4 w-4" /> ייצוא דוח
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-gradient-card p-5 shadow-soft">
          <div className="text-xs text-muted-foreground">סך לקוחות</div>
          <div className="mt-2 text-3xl font-bold">{total}</div>
        </Card>
        <Card className="border-border/60 bg-gradient-card p-5 shadow-soft">
          <div className="text-xs text-muted-foreground">לקוחות שהשתפרו</div>
          <div className="mt-2 text-3xl font-bold text-success">{improved}</div>
        </Card>
        <Card className="border-border/60 bg-gradient-card p-5 shadow-soft">
          <div className="text-xs text-muted-foreground">לקוחות בהידרדרות</div>
          <div className="mt-2 text-3xl font-bold text-destructive">{worsened}</div>
        </Card>
        <Card className="border-border/60 bg-gradient-card p-5 shadow-soft">
          <div className="text-xs text-muted-foreground">ניצול תקציב ממוצע</div>
          <div className="mt-2 text-3xl font-bold">{avgUsage}%</div>
        </Card>
      </div>

      <Card className="border-border/60 p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <FileBarChart className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">סיכום חודשי</h2>
        </div>
        <ul className="space-y-2 text-sm">
          <li>• סך הכל נשלחו <strong>12</strong> המלצות החודש</li>
          <li>• <strong>{worsened}</strong> לקוחות זקוקים להתערבות מיידית</li>
          <li>• הקטגוריות הבעייתיות ביותר: מזון, קניות</li>
          <li>• <strong>3</strong> התראות חריגה השבוע</li>
        </ul>
      </Card>
    </div>
  );
}
