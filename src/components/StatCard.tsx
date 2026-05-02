import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendType?: "up" | "down" | "neutral" | "warn";
  icon: LucideIcon;
  iconBg?: string;
}

export function StatCard({ label, value, trend, trendType = "neutral", icon: Icon, iconBg }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/60 bg-gradient-card p-5 shadow-soft transition-all hover:shadow-elegant hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
          {trend && (
            <div
              className={cn(
                "mt-1 text-xs font-medium",
                trendType === "up" && "text-destructive",
                trendType === "down" && "text-success",
                trendType === "warn" && "text-warning",
                trendType === "neutral" && "text-muted-foreground"
              )}
            >
              {trend}
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl shadow-soft shrink-0",
            iconBg ?? "bg-gradient-primary"
          )}
        >
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
    </Card>
  );
}
