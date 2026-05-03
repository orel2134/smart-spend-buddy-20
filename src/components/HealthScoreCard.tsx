import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart } from "lucide-react";
import type { HealthScore } from "@/lib/insights";
import { cn } from "@/lib/utils";

export function HealthScoreCard({ health }: { health: HealthScore }) {
  const { score, grade, components, summary } = health;
  const color = score >= 75 ? "text-success" : score >= 60 ? "text-primary" : score >= 40 ? "text-warning" : "text-destructive";
  const ringColor = score >= 75 ? "stroke-success" : score >= 60 ? "stroke-primary" : score >= 40 ? "stroke-warning" : "stroke-destructive";
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card className="border-border/60 bg-gradient-card p-6 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Heart className="h-3.5 w-3.5" />
        ציון בריאות פיננסית
      </div>

      <div className="mt-4 flex items-center gap-6">
        <div className="relative h-32 w-32 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" strokeWidth="8" fill="none" className="stroke-muted" />
            <circle
              cx="50" cy="50" r="45" strokeWidth="8" fill="none" strokeLinecap="round"
              className={cn("transition-all duration-700", ringColor)}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={cn("text-3xl font-bold", color)}>{score}</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn("text-xl font-bold", color)}>{grade}</div>
          <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {components.map((c) => (
          <div key={c.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium">{c.label}</span>
              <span className="text-muted-foreground">{c.value}/{c.max}</span>
            </div>
            <Progress value={(c.value / c.max) * 100} className="h-1.5" />
            <div className="mt-1 text-xs text-muted-foreground">{c.note}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
