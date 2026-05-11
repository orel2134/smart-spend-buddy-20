import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DEMO_CLIENTS, statusOf } from "@/lib/advisor-demo";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_app/advisor/clients")({
  head: () => ({ meta: [{ title: "לקוחות — SmartSpend" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const [q, setQ] = useState("");
  const filtered = DEMO_CLIENTS.filter((c) =>
    c.fullName.includes(q) || c.email.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">לקוחות</h1>
        <p className="mt-1 text-sm text-muted-foreground">ניהול ומעקב אחר כל הלקוחות שלך</p>
      </div>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש לקוח..." className="pr-10" />
      </div>
      <Card className="border-border/60 p-2 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="p-3 text-right">שם</th>
                <th className="p-3 text-right">אימייל</th>
                <th className="p-3 text-right">תקציב</th>
                <th className="p-3 text-right">הוצאות</th>
                <th className="p-3 text-right">ניצול</th>
                <th className="p-3 text-right">ציון</th>
                <th className="p-3 text-right">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const s = statusOf(c);
                const usage = Math.round((c.currentSpending / c.monthlyBudget) * 100);
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <Link to="/advisor/client/$id" params={{ id: c.id }} className="font-medium text-primary hover:underline">{c.fullName}</Link>
                    </td>
                    <td className="p-3 text-muted-foreground">{c.email}</td>
                    <td className="p-3">{formatCurrency(c.monthlyBudget)}</td>
                    <td className="p-3">{formatCurrency(c.currentSpending)}</td>
                    <td className="p-3">{usage}%</td>
                    <td className="p-3 font-semibold">{c.healthScore}</td>
                    <td className="p-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium",
                        s.tone === "critical" ? "bg-destructive/15 text-destructive" :
                        s.tone === "warning" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                      )}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
