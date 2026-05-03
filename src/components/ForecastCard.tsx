import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { MonthForecast } from "@/lib/insights";
import { cn } from "@/lib/utils";

export function ForecastCard({ forecast }: { forecast: MonthForecast }) {
  const { spentSoFar, projectedTotal, projectedRemaining, budget, willOverBudget, exceedDay, daysIn, daysTotal, daysLeft } = forecast;
  const pct = budget > 0 ? Math.min(100, (projectedTotal / budget) * 100) : 0;

  return (
    <Card className="border-border/60 bg-gradient-card p-6 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            תחזית סוף חודש · יום {daysIn}/{daysTotal}
          </div>
          <h3 className="mt-1 text-lg font-semibold">תחזית הוצאות</h3>
        </div>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl shadow-soft",
          willOverBudget ? "bg-destructive" : "bg-gradient-success"
        )}>
          {willOverBudget ? <TrendingUp className="h-5 w-5 text-destructive-foreground" /> : <TrendingDown className="h-5 w-5 text-success-foreground" />}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground">הוצאת עד היום</div>
          <div className="mt-1 text-2xl font-bold">{formatCurrency(spentSoFar)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">תחזית לסוף החודש</div>
          <div className={cn("mt-1 text-2xl font-bold", willOverBudget && "text-destructive")}>{formatCurrency(projectedTotal)}</div>
        </div>
      </div>

      {budget > 0 && (
        <>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-muted-foreground">תקציב חודשי: {formatCurrency(budget)}</span>
              <span className={cn("font-medium", willOverBudget ? "text-destructive" : "text-success")}>{Math.round(pct)}%</span>
            </div>
            <Progress value={pct} className={willOverBudget ? "[&>div]:bg-destructive" : "[&>div]:bg-success"} />
          </div>

          <div className={cn(
            "mt-4 rounded-lg p-3 text-sm",
            willOverBudget ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-success/10 text-success border border-success/20"
          )}>
            {willOverBudget ? (
              <>
                <strong>חריגה צפויה של {formatCurrency(Math.abs(projectedRemaining))}.</strong>
                {exceedDay && exceedDay <= daysTotal && exceedDay > daysIn && (
                  <> תחרוג מהתקציב סביב יום {exceedDay} (בעוד {exceedDay - daysIn} ימים).</>
                )}
              </>
            ) : (
              <><strong>אתה בקצב טוב!</strong> צפויים להישאר לך {formatCurrency(projectedRemaining)} בסוף החודש.</>
            )}
          </div>
        </>
      )}

      {budget === 0 && (
        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          הגדר תקציב חודשי כדי לקבל תחזיות מדויקות יותר. נותרו {daysLeft} ימים בחודש.
        </div>
      )}
    </Card>
  );
}
