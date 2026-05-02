import { getCategory, type CategoryKey } from "./categories";

export interface ExpenseRow {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  payment_method: string;
  expense_date: string;
}

export interface BudgetRow {
  id: string;
  category: string | null;
  amount: number;
  period: string;
}

const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfPrevMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() - 1, 1);
const endOfPrevMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59);

export function filterByMonth(expenses: ExpenseRow[], date = new Date()) {
  const start = startOfMonth(date);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return expenses.filter((e) => {
    const d = new Date(e.expense_date);
    return d >= start && d < end;
  });
}

export function filterPrevMonth(expenses: ExpenseRow[]) {
  const start = startOfPrevMonth();
  const end = endOfPrevMonth();
  return expenses.filter((e) => {
    const d = new Date(e.expense_date);
    return d >= start && d <= end;
  });
}

export const sumAmount = (rows: ExpenseRow[]) => rows.reduce((s, r) => s + Number(r.amount), 0);

export function byCategory(rows: ExpenseRow[]) {
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(r.category, (map.get(r.category) ?? 0) + Number(r.amount)));
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount, ...getCategory(category) }))
    .sort((a, b) => b.amount - a.amount);
}

export function biggestCategory(rows: ExpenseRow[]) {
  const list = byCategory(rows);
  return list[0] ?? null;
}

export function monthOverMonthChange(current: number, prev: number) {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 100);
}

export function dailyTrend(rows: ExpenseRow[], date = new Date()) {
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const result: { day: number; amount: number; label: string }[] = [];
  for (let i = 1; i <= days; i++) {
    const dayRows = rows.filter((r) => new Date(r.expense_date).getDate() === i);
    result.push({ day: i, amount: sumAmount(dayRows), label: `${i}` });
  }
  return result;
}

export function lastMonthsTrend(rows: ExpenseRow[], months = 6) {
  const result: { month: string; amount: number }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const total = sumAmount(rows.filter((r) => {
      const rd = new Date(r.expense_date);
      return rd >= d && rd < end;
    }));
    result.push({
      month: d.toLocaleDateString("he-IL", { month: "short" }),
      amount: total,
    });
  }
  return result;
}

export interface BudgetUsage {
  category: string | null;
  label: string;
  budget: number;
  spent: number;
  percent: number;
  status: "ok" | "warning" | "critical";
}

export function budgetUsage(budgets: BudgetRow[], monthExpenses: ExpenseRow[]): BudgetUsage[] {
  const totalSpent = sumAmount(monthExpenses);
  return budgets.map((b) => {
    const spent = b.category
      ? sumAmount(monthExpenses.filter((e) => e.category === b.category))
      : totalSpent;
    const percent = b.amount > 0 ? Math.round((spent / Number(b.amount)) * 100) : 0;
    const status: BudgetUsage["status"] = percent >= 100 ? "critical" : percent >= 80 ? "warning" : "ok";
    const label = b.category ? getCategory(b.category).label : "תקציב כללי";
    return { category: b.category, label, budget: Number(b.amount), spent, percent, status };
  });
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical" | "success";
}

export function generateInsights(
  expenses: ExpenseRow[],
  budgets: BudgetRow[]
): Insight[] {
  const insights: Insight[] = [];
  const current = filterByMonth(expenses);
  const prev = filterPrevMonth(expenses);
  const currentTotal = sumAmount(current);
  const prevTotal = sumAmount(prev);

  // Month over month
  if (prevTotal > 0) {
    const change = monthOverMonthChange(currentTotal, prevTotal);
    if (change >= 15) {
      insights.push({
        id: "mom-up",
        title: "עלייה בהוצאות החודש",
        description: `ההוצאות שלך עלו ב-${change}% לעומת החודש הקודם.`,
        severity: "warning",
      });
    } else if (change <= -10) {
      insights.push({
        id: "mom-down",
        title: "כל הכבוד! חיסכון יפה",
        description: `הוצאת ${Math.abs(change)}% פחות בהשוואה לחודש שעבר.`,
        severity: "success",
      });
    }
  }

  // Per category change
  const currentByCat = byCategory(current);
  const prevByCat = byCategory(prev);
  for (const cat of currentByCat.slice(0, 5)) {
    const prevCat = prevByCat.find((p) => p.category === cat.category);
    if (prevCat && prevCat.amount > 0) {
      const change = monthOverMonthChange(cat.amount, prevCat.amount);
      if (change >= 25) {
        insights.push({
          id: `cat-${cat.category}-up`,
          title: `עלייה ב${cat.label}`,
          description: `הוצאות ${cat.label} גבוהות ב-${change}% מהחודש הקודם.`,
          severity: "warning",
        });
      }
    }
  }

  // Budget usage
  const usage = budgetUsage(budgets, current);
  for (const u of usage) {
    if (u.status === "critical") {
      insights.push({
        id: `budget-${u.category ?? "total"}-over`,
        title: `חריגה מתקציב — ${u.label}`,
        description: `ניצלת ${u.percent}% מהתקציב (${Math.round(u.spent)} מתוך ${u.budget}).`,
        severity: "critical",
      });
    } else if (u.status === "warning") {
      insights.push({
        id: `budget-${u.category ?? "total"}-near`,
        title: `מתקרבים לחריגה — ${u.label}`,
        description: `ניצלת ${u.percent}% מהתקציב של ${u.label}.`,
        severity: "warning",
      });
    }
  }

  // Pace projection
  const today = new Date();
  const daysIn = today.getDate();
  const daysTotal = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const totalBudget = budgets.find((b) => !b.category)?.amount;
  if (totalBudget && daysIn >= 5) {
    const projected = (currentTotal / daysIn) * daysTotal;
    if (projected > Number(totalBudget) * 1.05) {
      const exceedDay = Math.ceil((Number(totalBudget) / currentTotal) * daysIn);
      const daysLeft = Math.max(1, exceedDay - daysIn);
      insights.push({
        id: "pace-warn",
        title: "תחזית חריגה מהתקציב",
        description: `בקצב הנוכחי תחרוג מהתקציב החודשי בעוד כ-${daysLeft} ימים.`,
        severity: "warning",
      });
    }
  }

  // Weekend spending
  const weekend = current.filter((e) => {
    const d = new Date(e.expense_date).getDay();
    return d === 5 || d === 6;
  });
  if (current.length > 5 && sumAmount(weekend) > currentTotal * 0.5) {
    insights.push({
      id: "weekend",
      title: "רוב ההוצאות בסופי שבוע",
      description: "מעל מחצית מההוצאות שלך החודש מתרחשות בסופי שבוע.",
      severity: "info",
    });
  }

  return insights;
}

export function recommendations(insights: Insight[], usage: BudgetUsage[]): string[] {
  const recs: string[] = [];
  const overCats = usage.filter((u) => u.status !== "ok").map((u) => u.label);
  if (overCats.length) {
    recs.push(`שקול לצמצם הוצאות בקטגוריות: ${overCats.join(", ")}.`);
  }
  if (insights.some((i) => i.id === "weekend")) {
    recs.push("נסה לתכנן מראש את הוצאות סוף השבוע כדי להישאר בתקציב.");
  }
  if (insights.some((i) => i.severity === "critical")) {
    recs.push("בדוק את ההוצאות הלא חיוניות החודש וצמצם היכן שאפשר.");
  }
  if (recs.length === 0) {
    recs.push("העבודה שלך מצוינת! המשך לעקוב באופן קבוע אחר ההוצאות שלך.");
    recs.push("שקול להגדיר יעד חיסכון חודשי כדי להמשיך להתקדם.");
  }
  return recs;
}

export type { CategoryKey };
