export const formatCurrency = (n: number, currency = "₪") =>
  `${currency}${Math.round(n).toLocaleString("he-IL")}`;

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });

export const formatMonth = (d: string | Date) =>
  new Date(d).toLocaleDateString("he-IL", { month: "long", year: "numeric" });
