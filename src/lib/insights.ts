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

// ============================================================
// Advanced: Forecast, Anomalies, Recurring, Health Score
// ============================================================

export interface MonthForecast {
  daysIn: number;
  daysTotal: number;
  daysLeft: number;
  spentSoFar: number;
  dailyAverage: number;
  projectedTotal: number;
  projectedRemaining: number; // budget - projected (can be negative)
  budget: number;
  willOverBudget: boolean;
  exceedDay: number | null; // day of month projected to exceed budget
}

export function forecastMonth(expenses: ExpenseRow[], budgets: BudgetRow[]): MonthForecast {
  const today = new Date();
  const daysIn = today.getDate();
  const daysTotal = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = daysTotal - daysIn;
  const current = filterByMonth(expenses);
  const spentSoFar = sumAmount(current);
  const dailyAverage = daysIn > 0 ? spentSoFar / daysIn : 0;
  const projectedTotal = dailyAverage * daysTotal;
  const totalBudget = Number(budgets.find((b) => !b.category)?.amount ?? 0);
  const projectedRemaining = totalBudget - projectedTotal;
  const willOverBudget = totalBudget > 0 && projectedTotal > totalBudget;
  let exceedDay: number | null = null;
  if (willOverBudget && dailyAverage > 0) {
    exceedDay = Math.min(daysTotal, Math.ceil(totalBudget / dailyAverage));
  }
  return {
    daysIn, daysTotal, daysLeft, spentSoFar, dailyAverage,
    projectedTotal, projectedRemaining, budget: totalBudget,
    willOverBudget, exceedDay,
  };
}

// --- Anomaly detection (compare to previous months avg) ---
export interface CategoryAnomaly {
  category: string;
  label: string;
  current: number;
  average: number;
  delta: number; // percent
  severity: "info" | "warning" | "critical";
}

export function categoryAnomalies(expenses: ExpenseRow[], lookbackMonths = 3): CategoryAnomaly[] {
  const now = new Date();
  const current = filterByMonth(expenses, now);
  const currentByCat = byCategory(current);
  const monthlyTotals: Map<string, number[]> = new Map();
  for (let i = 1; i <= lookbackMonths; i++) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const rows = filterByMonth(expenses, ref);
    byCategory(rows).forEach((c) => {
      const arr = monthlyTotals.get(c.category) ?? [];
      arr.push(c.amount);
      monthlyTotals.set(c.category, arr);
    });
  }
  const result: CategoryAnomaly[] = [];
  for (const c of currentByCat) {
    const past = monthlyTotals.get(c.category) ?? [];
    if (past.length === 0) continue;
    const avg = past.reduce((s, n) => s + n, 0) / past.length;
    if (avg < 30) continue; // ignore tiny categories
    const delta = Math.round(((c.amount - avg) / avg) * 100);
    if (delta < 30) continue;
    result.push({
      category: c.category,
      label: c.label,
      current: c.amount,
      average: avg,
      delta,
      severity: delta >= 80 ? "critical" : delta >= 50 ? "warning" : "info",
    });
  }
  return result.sort((a, b) => b.delta - a.delta);
}

// Detect single-expense outliers compared to user's typical spend in that category
export interface ExpenseOutlier {
  expense: ExpenseRow;
  categoryAverage: number;
  multiplier: number;
}
export function expenseOutliers(expenses: ExpenseRow[]): ExpenseOutlier[] {
  const byCat = new Map<string, number[]>();
  expenses.forEach((e) => {
    const arr = byCat.get(e.category) ?? [];
    arr.push(Number(e.amount));
    byCat.set(e.category, arr);
  });
  const out: ExpenseOutlier[] = [];
  const current = filterByMonth(expenses);
  for (const e of current) {
    const arr = byCat.get(e.category) ?? [];
    if (arr.length < 5) continue;
    const avg = arr.reduce((s, n) => s + n, 0) / arr.length;
    const amt = Number(e.amount);
    if (amt >= avg * 2.5 && amt > 100) {
      out.push({ expense: e, categoryAverage: avg, multiplier: amt / avg });
    }
  }
  return out.sort((a, b) => b.multiplier - a.multiplier).slice(0, 5);
}

// --- Recurring/subscription detection ---
export interface RecurringExpense {
  signature: string;
  description: string;
  category: string;
  amount: number;
  occurrences: number;
  lastDate: string;
  monthsSeen: number;
}

function normalizeDesc(s: string | null): string {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ").slice(0, 40);
}

export function detectRecurring(expenses: ExpenseRow[]): RecurringExpense[] {
  const groups = new Map<string, ExpenseRow[]>();
  for (const e of expenses) {
    const desc = normalizeDesc(e.description);
    if (!desc) continue;
    // bucket by similar amount (within 5%)
    const amt = Number(e.amount);
    const bucket = Math.round(amt / Math.max(1, amt * 0.05)) * Math.max(1, amt * 0.05);
    const sig = `${desc}|${e.category}|${Math.round(bucket)}`;
    const arr = groups.get(sig) ?? [];
    arr.push(e);
    groups.set(sig, arr);
  }
  const result: RecurringExpense[] = [];
  for (const [sig, arr] of groups.entries()) {
    if (arr.length < 2) continue;
    const months = new Set(arr.map((e) => e.expense_date.slice(0, 7)));
    if (months.size < 2) continue;
    const sorted = [...arr].sort((a, b) => b.expense_date.localeCompare(a.expense_date));
    const avg = arr.reduce((s, r) => s + Number(r.amount), 0) / arr.length;
    result.push({
      signature: sig,
      description: sorted[0].description ?? "",
      category: sorted[0].category,
      amount: Math.round(avg),
      occurrences: arr.length,
      lastDate: sorted[0].expense_date,
      monthsSeen: months.size,
    });
  }
  return result.sort((a, b) => b.monthsSeen - a.monthsSeen || b.amount - a.amount);
}

// --- Financial Health Score (0-100) ---
export interface HealthScore {
  score: number;
  grade: "מצוין" | "טוב מאוד" | "טוב" | "בינוני" | "דורש שיפור";
  components: { label: string; value: number; max: number; note: string }[];
  summary: string;
}

export function financialHealthScore(expenses: ExpenseRow[], budgets: BudgetRow[]): HealthScore {
  const components: HealthScore["components"] = [];
  const current = filterByMonth(expenses);
  const prev = filterPrevMonth(expenses);
  const usage = budgetUsage(budgets, current);
  const forecast = forecastMonth(expenses, budgets);
  const anomalies = categoryAnomalies(expenses);

  // 1. Budget adherence (30 pts)
  let budgetPts = 30;
  if (usage.length === 0) {
    budgetPts = 15; // partial — no budget set
    components.push({ label: "עמידה בתקציב", value: 15, max: 30, note: "עדיין לא הגדרת תקציב" });
  } else {
    const critical = usage.filter((u) => u.status === "critical").length;
    const warning = usage.filter((u) => u.status === "warning").length;
    budgetPts = Math.max(0, 30 - critical * 12 - warning * 5);
    components.push({
      label: "עמידה בתקציב", value: budgetPts, max: 30,
      note: critical ? `${critical} חריגות בתקציב` : warning ? `${warning} קטגוריות מתקרבות` : "כל התקציבים בשליטה",
    });
  }

  // 2. Spending trend (25 pts)
  let trendPts = 20;
  let trendNote = "אין נתוני השוואה";
  if (prev.length > 0) {
    const change = monthOverMonthChange(sumAmount(current), sumAmount(prev));
    if (change <= -5) { trendPts = 25; trendNote = `ירידה של ${Math.abs(change)}% מהחודש שעבר`; }
    else if (change <= 5) { trendPts = 22; trendNote = "יציבות בהוצאות"; }
    else if (change <= 15) { trendPts = 15; trendNote = `עלייה של ${change}%`; }
    else if (change <= 30) { trendPts = 8; trendNote = `עלייה משמעותית של ${change}%`; }
    else { trendPts = 2; trendNote = `קפיצה חדה של ${change}%`; }
  }
  components.push({ label: "מגמת הוצאות", value: trendPts, max: 25, note: trendNote });

  // 3. Anomalies (20 pts)
  const anomalyPts = Math.max(0, 20 - anomalies.length * 5);
  components.push({
    label: "יציבות לפי קטגוריות", value: anomalyPts, max: 20,
    note: anomalies.length ? `${anomalies.length} קטגוריות חורגות מההרגל` : "ללא חריגות התנהגותיות",
  });

  // 4. Forecast (25 pts)
  let forecastPts = 20;
  let forecastNote = "אין תחזית — הגדר תקציב";
  if (forecast.budget > 0) {
    const ratio = forecast.projectedTotal / forecast.budget;
    if (ratio <= 0.85) { forecastPts = 25; forecastNote = "תחזית מצוינת לסוף החודש"; }
    else if (ratio <= 1.0) { forecastPts = 20; forecastNote = "תסיים את החודש בתקציב"; }
    else if (ratio <= 1.15) { forecastPts = 10; forecastNote = `חריגה צפויה של ${Math.round((ratio - 1) * 100)}%`; }
    else { forecastPts = 3; forecastNote = `חריגה משמעותית צפויה (${Math.round((ratio - 1) * 100)}%)`; }
  }
  components.push({ label: "תחזית סוף חודש", value: forecastPts, max: 25, note: forecastNote });

  const total = budgetPts + trendPts + anomalyPts + forecastPts;
  const score = Math.round(total);
  const grade: HealthScore["grade"] =
    score >= 90 ? "מצוין" : score >= 75 ? "טוב מאוד" : score >= 60 ? "טוב" : score >= 40 ? "בינוני" : "דורש שיפור";

  let summary = "";
  if (score >= 90) summary = "הניהול הפיננסי שלך מעולה. המשך כך! 🌟";
  else if (score >= 75) summary = "אתה במצב פיננסי טוב מאוד עם מקום קל לשיפור.";
  else if (score >= 60) summary = "המצב יציב, אבל יש מקום לשיפור בכמה תחומים.";
  else if (score >= 40) summary = "כדאי לבחון מחדש את הרגלי ההוצאה והתקציב.";
  else summary = "המצב הפיננסי דורש תשומת לב מיידית. בוא נבנה תוכנית.";

  return { score, grade, components, summary };
}

// --- "What if?" simulator ---
export interface SimulationResult {
  monthlySaving: number;
  yearlySaving: number;
  newProjectedTotal: number;
  newProjectedRemaining: number;
  description: string;
}

export function simulateReduction(
  expenses: ExpenseRow[],
  budgets: BudgetRow[],
  category: string | "all",
  reductionPercent: number
): SimulationResult {
  const monthsLookback = 3;
  const now = new Date();
  let baseline = 0;
  for (let i = 0; i < monthsLookback; i++) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const rows = filterByMonth(expenses, ref);
    if (category === "all") baseline += sumAmount(rows);
    else baseline += sumAmount(rows.filter((e) => e.category === category));
  }
  const avgMonthly = baseline / monthsLookback;
  const monthlySaving = (avgMonthly * reductionPercent) / 100;
  const yearlySaving = monthlySaving * 12;

  const forecast = forecastMonth(expenses, budgets);
  const newProjectedTotal = Math.max(0, forecast.projectedTotal - monthlySaving);
  const newProjectedRemaining = forecast.budget - newProjectedTotal;

  const catLabel = category === "all" ? "כל ההוצאות" : getCategory(category).label;
  const description = `הפחתה של ${reductionPercent}% ב${catLabel} תחסוך לך כ-${Math.round(monthlySaving).toLocaleString("he-IL")}₪ בחודש (${Math.round(yearlySaving).toLocaleString("he-IL")}₪ בשנה).`;

  return { monthlySaving, yearlySaving, newProjectedTotal, newProjectedRemaining, description };
}

export function simulateFixedSaving(monthlyAmount: number) {
  return {
    monthlySaving: monthlyAmount,
    yearlySaving: monthlyAmount * 12,
    threeYearSaving: monthlyAmount * 36,
    description: `חיסכון של ${monthlyAmount.toLocaleString("he-IL")}₪ בחודש = ${(monthlyAmount * 12).toLocaleString("he-IL")}₪ בשנה.`,
  };
}

// --- Challenges (gamification) ---
export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number; // 0..100
  status: "active" | "completed" | "failed";
  detail: string;
}

export function generateChallenges(expenses: ExpenseRow[], budgets: BudgetRow[]): Challenge[] {
  const challenges: Challenge[] = [];
  const current = filterByMonth(expenses);
  const today = new Date();
  const daysIn = today.getDate();
  const daysTotal = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  // Challenge 1: Reduce food/dining by 10%
  const food = current.filter((e) => e.category === "food");
  const prevFood = filterPrevMonth(expenses).filter((e) => e.category === "food");
  if (prevFood.length > 0) {
    const target = sumAmount(prevFood) * 0.9;
    const spent = sumAmount(food);
    const projected = (spent / Math.max(1, daysIn)) * daysTotal;
    const progress = Math.min(100, Math.max(0, ((target - projected) / target) * 100 + 50));
    challenges.push({
      id: "food-10",
      title: "צמצום 10% במזון",
      description: `יעד: ${Math.round(target)}₪ החודש`,
      progress: Math.round(progress),
      status: projected <= target ? "active" : "failed",
      detail: `הוצאת עד עכשיו ${Math.round(spent)}₪ · תחזית: ${Math.round(projected)}₪`,
    });
  }

  // Challenge 2: No-shopping streak
  const shoppingDays = new Set(current.filter((e) => e.category === "shopping").map((e) => e.expense_date));
  let streak = 0;
  for (let i = 0; i < daysIn; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (shoppingDays.has(key)) break;
    streak++;
  }
  challenges.push({
    id: "no-shopping-7",
    title: "שבוע ללא קניות",
    description: "7 ימים רצופים בלי הוצאות בקטגוריית קניות",
    progress: Math.min(100, (streak / 7) * 100),
    status: streak >= 7 ? "completed" : "active",
    detail: `רצף נוכחי: ${streak} ימים`,
  });

  // Challenge 3: Save 300₪ this month vs prev month
  const prevTotal = sumAmount(filterPrevMonth(expenses));
  const currentTotal = sumAmount(current);
  const projected = (currentTotal / Math.max(1, daysIn)) * daysTotal;
  if (prevTotal > 0) {
    const saved = prevTotal - projected;
    const progress = Math.min(100, Math.max(0, (saved / 300) * 100));
    challenges.push({
      id: "save-300",
      title: "לחסוך 300₪ החודש",
      description: "להוציא 300₪ פחות מהחודש הקודם",
      progress: Math.round(progress),
      status: saved >= 300 ? "completed" : projected > prevTotal + 100 ? "failed" : "active",
      detail: saved >= 0 ? `בקצב הנוכחי: חיסכון של ${Math.round(saved)}₪` : `כרגע מעל החודש שעבר ב-${Math.round(-saved)}₪`,
    });
  }

  // Challenge 4: Stay within total budget
  const totalBudget = Number(budgets.find((b) => !b.category)?.amount ?? 0);
  if (totalBudget > 0) {
    const usagePct = (currentTotal / totalBudget) * 100;
    challenges.push({
      id: "budget-month",
      title: "לסיים את החודש בתקציב",
      description: `תקציב: ${totalBudget.toLocaleString("he-IL")}₪`,
      progress: Math.min(100, usagePct),
      status: usagePct >= 100 ? "failed" : "active",
      detail: `נצלת ${Math.round(usagePct)}% מהתקציב · ${daysTotal - daysIn} ימים נותרו`,
    });
  }

  return challenges;
}
