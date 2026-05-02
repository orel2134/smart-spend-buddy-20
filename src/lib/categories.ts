import { Utensils, Car, Home, ShoppingBag, Heart, Film, GraduationCap, Receipt, MoreHorizontal, type LucideIcon } from "lucide-react";

export type CategoryKey =
  | "food" | "transportation" | "rent" | "shopping"
  | "health" | "entertainment" | "education" | "bills" | "other";

export const CATEGORIES: { key: CategoryKey; label: string; icon: LucideIcon; color: string }[] = [
  { key: "food", label: "מזון", icon: Utensils, color: "oklch(0.7 0.17 50)" },
  { key: "transportation", label: "תחבורה", icon: Car, color: "oklch(0.6 0.18 230)" },
  { key: "rent", label: "שכירות", icon: Home, color: "oklch(0.55 0.18 280)" },
  { key: "shopping", label: "קניות", icon: ShoppingBag, color: "oklch(0.65 0.22 340)" },
  { key: "health", label: "בריאות", icon: Heart, color: "oklch(0.65 0.2 20)" },
  { key: "entertainment", label: "בילוי", icon: Film, color: "oklch(0.6 0.2 310)" },
  { key: "education", label: "חינוך", icon: GraduationCap, color: "oklch(0.6 0.16 200)" },
  { key: "bills", label: "חשבונות", icon: Receipt, color: "oklch(0.55 0.15 160)" },
  { key: "other", label: "אחר", icon: MoreHorizontal, color: "oklch(0.55 0.04 255)" },
];

export const PAYMENT_METHODS = [
  { key: "cash", label: "מזומן" },
  { key: "credit_card", label: "כרטיס אשראי" },
  { key: "bank_transfer", label: "העברה בנקאית" },
  { key: "digital_wallet", label: "ארנק דיגיטלי" },
];

export function getCategory(key: string) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function getPaymentLabel(key: string) {
  return PAYMENT_METHODS.find((p) => p.key === key)?.label ?? key;
}
