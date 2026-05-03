import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Receipt, AlertTriangle, Flame } from "lucide-react";
import { CATEGORIES, getCategory, getPaymentLabel } from "@/lib/categories";
import { categoryAnomalies, expenseOutliers } from "@/lib/insights";
import { formatCurrency, formatDate } from "@/lib/format";
import { ExpenseDialog } from "@/components/ExpenseDialog";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_app/expenses")({
  head: () => ({ meta: [{ title: "הוצאות — SmartSpend" }] }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { expenses, loading, refresh } = useExpenses();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<typeof expenses[number] | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (catFilter !== "all" && e.category !== catFilter) return false;
      if (search && !(e.description ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [expenses, search, catFilter]);

  const anomalies = useMemo(() => categoryAnomalies(expenses), [expenses]);
  const outliers = useMemo(() => expenseOutliers(expenses), [expenses]);
  const outlierIds = useMemo(() => new Set(outliers.map((o) => o.expense.id)), [outliers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("expenses").delete().eq("id", deleteId);
    if (error) { toast.error("מחיקה נכשלה"); return; }
    toast.success("ההוצאה נמחקה");
    setDeleteId(null);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">הוצאות</h1>
          <p className="mt-1 text-sm text-muted-foreground">נהל, סנן וחפש את כל ההוצאות שלך.</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setOpen(true); }} className="bg-gradient-primary shadow-soft gap-2">
          <Plus className="h-4 w-4" /> הוצאה חדשה
        </Button>
      </div>

      {anomalies.length > 0 && (
        <Card className="border-warning/30 bg-warning/5 p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/15">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">זיהינו חריגות מההתנהגות הרגילה שלך</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {anomalies.slice(0, 5).map((a) => (
                  <Badge key={a.category} variant="outline" className="border-warning/40 bg-card">
                    {a.label}: <span className="font-bold mx-1 text-warning">+{a.delta}%</span> מהממוצע
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="border-border/60 p-4 shadow-soft">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pr-9" placeholder="חיפוש לפי תיאור..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקטגוריות</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border-border/60 shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={expenses.length === 0 ? "עדיין אין הוצאות" : "לא נמצאו תוצאות"}
            description={expenses.length === 0 ? "הוסף את ההוצאה הראשונה שלך כדי להתחיל." : "נסה לשנות את הסינון או החיפוש."}
            action={expenses.length === 0 ? <Button onClick={() => { setEditing(undefined); setOpen(true); }} className="bg-gradient-primary gap-2"><Plus className="h-4 w-4" /> הוסף הוצאה</Button> : undefined}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">תיאור</TableHead>
                <TableHead className="text-right">קטגוריה</TableHead>
                <TableHead className="text-right">תשלום</TableHead>
                <TableHead className="text-right">תאריך</TableHead>
                <TableHead className="text-right">סכום</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => {
                const cat = getCategory(e.category);
                const Icon = cat.icon;
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.description || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1.5">
                        <Icon className="h-3 w-3" style={{ color: cat.color }} />
                        {cat.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{getPaymentLabel(e.payment_method)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(e.expense_date)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(Number(e.amount))}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(e); setOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(e.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <ExpenseDialog
        open={open}
        onOpenChange={setOpen}
        onSaved={refresh}
        initial={editing ? { ...editing, amount: Number(editing.amount) } : undefined}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק את ההוצאה?</AlertDialogTitle>
            <AlertDialogDescription>פעולה זו אינה הפיכה.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
