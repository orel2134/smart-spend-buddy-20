import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/advisor/invitations")({
  head: () => ({ meta: [{ title: "הזמנת לקוחות — SmartSpend" }] }),
  component: InvitationsPage,
});

function InvitationsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !form.email) return;
    setLoading(true);
    const { error } = await supabase.from("client_invitations").insert({
      advisor_id: user.id,
      client_email: form.email,
      client_name: form.name || null,
      message: form.message || null,
    });
    setLoading(false);
    if (error) return toast.error("שגיאה בשליחת ההזמנה");
    toast.success("ההזמנה נשלחה בהצלחה");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">הזמנת לקוחות</h1>
        <p className="mt-1 text-sm text-muted-foreground">שלח הזמנה ללקוח חדש להצטרף לפלטפורמה</p>
      </div>
      <Card className="border-border/60 p-6 shadow-soft">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם הלקוח</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ישראל ישראלי" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">אימייל הלקוח</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="client@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg">הודעה אישית</Label>
            <Textarea id="msg" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder="היי, אשמח אם תצטרף לפלטפורמה כדי שנוכל לעבוד יחד על התקציב שלך..." />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-primary shadow-soft gap-2">
            <Mail className="h-4 w-4" /> {loading ? "שולח..." : "שלח הזמנה"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
