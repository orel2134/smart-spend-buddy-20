import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot, User as UserIcon } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import {
  filterByMonth, filterPrevMonth, sumAmount, byCategory,
  forecastMonth, financialHealthScore, categoryAnomalies, budgetUsage,
} from "@/lib/insights";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/coach")({
  head: () => ({ meta: [{ title: "מאמן AI — SmartSpend" }] }),
  component: CoachPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "נתח לי את החודש",
  "מצא את הבעיה הכי גדולה שלי",
  "בנה לי תוכנית חיסכון",
  "הסבר לי את ההתראות",
  "איך לשפר את הציון הפיננסי שלי?",
  "מה תחזית סוף החודש?",
];

function buildContext(data: ReturnType<typeof useExpenses>): string {
  const { expenses, budgets } = data;
  if (expenses.length === 0) return "המשתמש עדיין לא הזין הוצאות.";
  const current = filterByMonth(expenses);
  const prev = filterPrevMonth(expenses);
  const cats = byCategory(current).slice(0, 6);
  const forecast = forecastMonth(expenses, budgets);
  const health = financialHealthScore(expenses, budgets);
  const anomalies = categoryAnomalies(expenses);
  const usage = budgetUsage(budgets, current);

  const lines = [
    `- סך הוצאות החודש: ${formatCurrency(sumAmount(current))} (${current.length} עסקאות)`,
    `- סך הוצאות החודש הקודם: ${formatCurrency(sumAmount(prev))}`,
    `- ציון בריאות פיננסית: ${health.score}/100 (${health.grade})`,
    `- תחזית סוף חודש: ${formatCurrency(forecast.projectedTotal)}${forecast.budget ? ` מתוך תקציב ${formatCurrency(forecast.budget)}` : ""}`,
    `- ${forecast.willOverBudget ? `צפויה חריגה של ${formatCurrency(forecast.projectedTotal - forecast.budget)}` : "צפוי להישאר בתקציב"}`,
    "- פירוט לפי קטגוריות החודש:",
    ...cats.map((c) => `  • ${c.label}: ${formatCurrency(c.amount)}`),
  ];
  if (usage.length) {
    lines.push("- ניצול תקציבים:");
    usage.forEach((u) => lines.push(`  • ${u.label}: ${u.percent}% (${formatCurrency(u.spent)} / ${formatCurrency(u.budget)})`));
  }
  if (anomalies.length) {
    lines.push("- חריגות מההרגל הרגיל:");
    anomalies.forEach((a) => lines.push(`  • ${a.label}: עלייה של ${a.delta}% מהממוצע`));
  }
  return lines.join("\n");
}

function CoachPage() {
  const data = useExpenses();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "שלום! אני **המאמן הפיננסי האישי** שלך 🤖\n\nאני יכול לעזור לך להבין איפה אתה מבזבז, איך לחסוך, ומה צפוי בסוף החודש. אפשר לשאול אותי כל דבר!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next.filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0).map(({ role, content }) => ({ role, content })),
          financialContext: buildContext(data),
        }),
      });

      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        toast.error(j.error || "שגיאה בקבלת תשובה");
        setLoading(false);
        return;
      }
      if (!resp.body) throw new Error("no body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      setMessages((p) => [...p, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const delta = p.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("שגיאה בהתחברות למאמן");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">מאמן פיננסי AI</h1>
          <p className="mt-1 text-sm text-muted-foreground">שאל כל שאלה — אני רואה את הנתונים שלך בזמן אמת.</p>
        </div>
      </div>

      <Card className="border-border/60 shadow-soft overflow-hidden">
        <div ref={scrollRef} className="h-[28rem] overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-background to-muted/20">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${m.role === "user" ? "bg-muted" : "bg-gradient-primary"}`}>
                {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary-foreground" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                {m.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:mt-2 prose-headings:mb-1">
                    <ReactMarkdown>{m.content || "..."}</ReactMarkdown>
                  </div>
                ) : (
                  <div>{m.content}</div>
                )}
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="rounded-2xl bg-card border border-border px-4 py-3 text-sm text-muted-foreground">חושב...</div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="border-t border-border bg-muted/30 px-5 py-3">
            <div className="text-xs text-muted-foreground mb-2">הצעות לשאלות:</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => send(s)} className="text-xs">{s}</Button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-border bg-background p-3">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="שאל את המאמן הפיננסי..." disabled={loading} />
          <Button type="submit" disabled={loading || !input.trim()} className="bg-gradient-primary gap-1">
            <Send className="h-4 w-4" /> שלח
          </Button>
        </form>
      </Card>
    </div>
  );
}
