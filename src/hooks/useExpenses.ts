import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { ExpenseRow, BudgetRow } from "@/lib/insights";

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: e }, { data: b }] = await Promise.all([
      supabase.from("expenses").select("*").order("expense_date", { ascending: false }).limit(1000),
      supabase.from("budgets").select("*"),
    ]);
    setExpenses((e ?? []) as ExpenseRow[]);
    setBudgets((b ?? []) as BudgetRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { expenses, budgets, loading, refresh };
}
