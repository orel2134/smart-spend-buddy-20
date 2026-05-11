import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { DEMO_CLIENTS } from "@/lib/advisor-demo";
import { CATEGORIES } from "@/lib/categories";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_app/advisor/recommendations")({
  head: () => ({ meta: [{ title: "המלצות — SmartSpend" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ clientId: typeof s.clientId === "string" ? s.clientId : "" }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const search = Route.useSearch();
  const [form, setForm] = useState({
    clientId: search.clientId, title: "", message: "", category: "food", priority: "medium",
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.title || !form.message) return toast.error("מלא את כל השדות הנדרשים");
    toast.success("ההמלצה נשלחה ללקוח");
    setForm({ clientId: "", title: "", message: "", category: "food", priority: "medium" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">שליחת המלצה ללקוח</h1>
        <p className="mt-1 text-sm text-muted-foreground">המלצות אישיות מבוססות על הנתונים של הלקוח</p>
      </div>
      <Card className="border-border/60 p-6 shadow-soft">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>בחר לקוח</Label>
            <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
              <SelectTrigger><SelectValue placeholder="בחר לקוח" /></SelectTrigger>
              <SelectContent>
                {DEMO_CLIENTS.map((c) => <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">כותרת ההמלצה</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="הפחת הוצאות מסעדות" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>קטגוריה</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>עדיפות</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">נמוכה</SelectItem>
                  <SelectItem value="medium">בינונית</SelectItem>
                  <SelectItem value="high">גבוהה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg">תוכן ההמלצה</Label>
            <Textarea id="msg" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="לפי הנתונים שלך, הוצאות המסעדות עלו ב-28% החודש. מומלץ להציב מגבלה שבועית של 250₪..." />
          </div>
          <Button type="submit" className="w-full bg-gradient-primary shadow-soft gap-2">
            <MessageSquare className="h-4 w-4" /> שלח המלצה
          </Button>
        </form>
      </Card>
    </div>
  );
}
