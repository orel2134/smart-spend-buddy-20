import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, PAYMENT_METHODS } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  initial?: {
    id: string;
    amount: number;
    category: string;
    description: string | null;
    payment_method: string;
    expense_date: string;
  };
}

const schema = z.object({
  amount: z.number().positive("סכום חייב להיות חיובי").max(10_000_000),
  category: z.string().min(1, "בחר קטגוריה"),
  description: z.string().max(500).optional(),
  payment_method: z.string().min(1),
  expense_date: z.string().min(1),
});

export function ExpenseDialog({ open, onOpenChange, onSaved, initial }: ExpenseDialogProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState(initial?.amount.toString() ?? "");
  const [category, setCategory] = useState(initial?.category ?? "food");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [paymentMethod, setPaymentMethod] = useState(initial?.payment_method ?? "credit_card");
  const [date, setDate] = useState(initial?.expense_date ?? new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setAmount(""); setCategory("food"); setDescription("");
    setPaymentMethod("credit_card"); setDate(new Date().toISOString().slice(0, 10));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({
      amount: parseFloat(amount),
      category, description: description || undefined,
      payment_method: paymentMethod, expense_date: date,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    const payload = { ...parsed.data, user_id: user.id, description: parsed.data.description ?? null };
    const { error } = initial
      ? await supabase.from("expenses").update(payload).eq("id", initial.id)
      : await supabase.from("expenses").insert(payload);
    setSaving(false);
    if (error) {
      toast.error("שמירה נכשלה", { description: error.message });
      return;
    }
    toast.success(initial ? "ההוצאה עודכנה" : "ההוצאה נוספה בהצלחה");
    if (!initial) reset();
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "עריכת הוצאה" : "הוצאה חדשה"}</DialogTitle>
          <DialogDescription>הזן את פרטי ההוצאה למעקב מדויק.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">סכום (₪)</Label>
              <Input id="amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">תאריך</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>קטגוריה</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>אמצעי תשלום</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((p) => (
                  <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">תיאור (אופציונלי)</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="לדוגמה: סופר רמי לוי" rows={2} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>ביטול</Button>
            <Button type="submit" className="flex-1 bg-gradient-primary" disabled={saving}>
              {saving ? "שומר..." : initial ? "עדכן" : "הוסף הוצאה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
