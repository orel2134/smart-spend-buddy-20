// Demo client data for advisor dashboard - replaced by real connections from advisor_clients table when available.

export interface DemoClient {
  id: string;
  fullName: string;
  email: string;
  monthlyBudget: number;
  currentSpending: number;
  healthScore: number;
  lastActivity: string;
  topCategory: string;
  trend: number; // % change vs prev month
  joinedAt: string;
}

export const DEMO_CLIENTS: DemoClient[] = [
  { id: "demo-1", fullName: "דניאל כהן", email: "daniel@example.com", monthlyBudget: 6000, currentSpending: 4200, healthScore: 82, lastActivity: "לפני שעתיים", topCategory: "food", trend: -5, joinedAt: "2024-09-12" },
  { id: "demo-2", fullName: "מאיה לוי", email: "maya@example.com", monthlyBudget: 5000, currentSpending: 4700, healthScore: 61, lastActivity: "לפני יום", topCategory: "shopping", trend: 18, joinedAt: "2024-11-04" },
  { id: "demo-3", fullName: "אמיר ביטון", email: "amir@example.com", monthlyBudget: 7000, currentSpending: 7600, healthScore: 42, lastActivity: "לפני 3 ימים", topCategory: "food", trend: 32, joinedAt: "2024-07-22" },
  { id: "demo-4", fullName: "נועה ישראלי", email: "noa@example.com", monthlyBudget: 5500, currentSpending: 3100, healthScore: 88, lastActivity: "אתמול", topCategory: "rent", trend: -8, joinedAt: "2025-01-15" },
];

export function statusOf(c: DemoClient): { label: string; tone: "good" | "warning" | "critical" } {
  const usage = c.currentSpending / c.monthlyBudget;
  if (usage > 1) return { label: "חריגה", tone: "critical" };
  if (usage > 0.85) return { label: "אזהרה", tone: "warning" };
  return { label: "תקין", tone: "good" };
}

export function riskReason(c: DemoClient): string {
  const usage = Math.round((c.currentSpending / c.monthlyBudget) * 100);
  if (usage > 100) return `חרג מהתקציב ב-${c.currentSpending - c.monthlyBudget}₪`;
  if (usage > 85) return `${usage}% מהתקציב נוצל`;
  if (c.trend > 25) return `עלייה של ${c.trend}% בהוצאות`;
  return "מצב פיננסי יציב";
}

export function recommendedAction(c: DemoClient): string {
  const usage = c.currentSpending / c.monthlyBudget;
  if (usage > 1) return "קבע פגישת בדיקה פיננסית דחופה";
  if (usage > 0.85) return "שלח המלצה להפחתת הוצאות לא חיוניות";
  if (c.trend > 25) return "הצע הגבלה שבועית לקטגוריה המובילה";
  return "המשך מעקב שגרתי";
}
