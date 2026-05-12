import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/categories";
import { Sparkles, Database, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "הגדרות — SmartSpend" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [currency, setCurrency] = useState("₪");
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [advisorEmail, setAdvisorEmail] = useState("");
  const [permission, setPermission] = useState("view_recommendations");
  const [connecting, setConnecting] = useState(false);
  const [role, setRole] = useState<string>("personal");

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setFullName(data.full_name ?? "");
        setCurrency(data.preferred_currency ?? "₪");
        setNotifications(data.notifications_enabled ?? true);
        setRole(data.role ?? "personal");
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      preferred_currency: currency,
      notifications_enabled: notifications,
    }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error("שמירה נכשלה"); return; }
    toast.success("ההגדרות נשמרו");
  };

  const handleSeed = async () => {
    if (!user) return;
    setSeeding(true);
    const today = new Date();
    const samples: { offsetDays: number; amount: number; category: string; description: string; payment_method: string }[] = [];

    // 4 months of demo data
    const templates = [
      { c: "rent", d: "שכירות חודשית", a: 3200, pm: "bank_transfer", day: 1 },
      { c: "bills", d: "חשבון חשמל", a: 280, pm: "bank_transfer", day: 5 },
      { c: "bills", d: "אינטרנט וסלולר", a: 180, pm: "credit_card", day: 8 },
      { c: "food", d: "קניות בסופר", a: 240, pm: "credit_card", day: 3 },
      { c: "food", d: "קניות בסופר", a: 320, pm: "credit_card", day: 14 },
      { c: "food", d: "מסעדה עם חברים", a: 180, pm: "credit_card", day: 19 },
      { c: "food", d: "קפה ומאפה", a: 38, pm: "digital_wallet", day: 22 },
      { c: "transportation", d: "רב קו", a: 90, pm: "credit_card", day: 2 },
      { c: "transportation", d: "דלק", a: 250, pm: "credit_card", day: 16 },
      { c: "shopping", d: "בגדים", a: 350, pm: "credit_card", day: 11 },
      { c: "shopping", d: "אקססוריז", a: 120, pm: "credit_card", day: 25 },
      { c: "health", d: "בית מרקחת", a: 120, pm: "cash", day: 7 },
      { c: "entertainment", d: "Netflix", a: 55, pm: "credit_card", day: 12 },
      { c: "entertainment", d: "סרט בקולנוע", a: 90, pm: "credit_card", day: 20 },
    ];

    for (let m = 0; m < 4; m++) {
      const ref = new Date(today.getFullYear(), today.getMonth() - m, 1);
      for (const t of templates) {
        const variation = m * 0.05 - 0.1 + Math.random() * 0.1;
        const amount = Math.round(t.a * (1 + variation));
        const day = Math.min(t.day, new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate());
        const date = new Date(ref.getFullYear(), ref.getMonth(), day);
        if (date > today) continue;
        samples.push({
          offsetDays: 0,
          amount,
          category: t.c,
          description: t.d,
          payment_method: t.pm,
        });
        // Use date directly via insert below
        (samples[samples.length - 1] as { date?: string }).date = date.toISOString().slice(0, 10);
      }
    }

    const rows = samples.map((s) => ({
      user_id: user.id,
      amount: s.amount,
      category: s.category,
      description: s.description,
      payment_method: s.payment_method,
      expense_date: (s as { date?: string }).date!,
    }));

    const { error } = await supabase.from("expenses").insert(rows);

    // Add demo budgets
    await supabase.from("budgets").upsert([
      { user_id: user.id, category: null, amount: 6000, period: "monthly" },
      { user_id: user.id, category: "food", amount: 1200, period: "monthly" },
      { user_id: user.id, category: "transportation", amount: 500, period: "monthly" },
      { user_id: user.id, category: "shopping", amount: 800, period: "monthly" },
    ], { onConflict: "user_id,category,period" });

    setSeeding(false);
    if (error) { toast.error("טעינת הדמו נכשלה", { description: error.message }); return; }
    toast.success("נטענו נתוני דמו ל-4 חודשים אחרונים", { description: "רענן את הדשבורד לצפייה" });
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">הגדרות</h1>
        <p className="mt-1 text-sm text-muted-foreground">נהל את הפרופיל וההעדפות שלך.</p>
      </div>

      <Card className="border-border/60 p-6 shadow-soft">
        <h3 className="font-semibold">פרופיל</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">שם מלא</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>אימייל</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>מטבע מועדף</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="₪">₪ שקל ישראלי</SelectItem>
                <SelectItem value="$">$ דולר</SelectItem>
                <SelectItem value="€">€ אירו</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between rounded-xl border border-border p-4">
          <div>
            <div className="font-medium">התראות חכמות</div>
            <div className="text-xs text-muted-foreground">קבל התראות על חריגות ומגמות</div>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>
        <Button onClick={handleSave} disabled={saving} className="mt-4 bg-gradient-primary">
          {saving ? "שומר..." : "שמור שינויים"}
        </Button>
      </Card>

      <Card className="border-primary/30 bg-gradient-card p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Database className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold flex items-center gap-2">
              נתוני דמו <Sparkles className="h-4 w-4 text-primary" />
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              טען 4 חודשים של הוצאות לדוגמה ותקציבים מומלצים כדי לראות את כל היכולות בפעולה.
            </p>
            <Button onClick={handleSeed} disabled={seeding} variant="outline" className="mt-3">
              {seeding ? "טוען..." : "טען נתוני דמו"}
            </Button>
          </div>
        </div>
      </Card>

      {role !== "advisor" && (
        <Card className="border-border/60 p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-success shadow-glow">
              <UserPlus className="h-6 w-6 text-success-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">חיבור ליועץ פיננסי</h3>
              <p className="mt-1 text-sm text-muted-foreground">ניתן לחבר יועץ פיננסי כדי לקבל המלצות אישיות על בסיס נתוני ההוצאות והתקציב שלך.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="advisorEmail">אימייל של היועץ</Label>
                  <Input id="advisorEmail" type="email" value={advisorEmail} onChange={(e) => setAdvisorEmail(e.target.value)} placeholder="advisor@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>רמת הרשאה</Label>
                  <Select value={permission} onValueChange={setPermission}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view_only">צפייה בלבד</SelectItem>
                      <SelectItem value="view_recommendations">צפייה + שליחת המלצות</SelectItem>
                      <SelectItem value="full_access">גישה מלאה לייעוץ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={async () => {
                  if (!user || !advisorEmail) return toast.error("הזן אימייל של יועץ");
                  setConnecting(true);
                  const { data: adv } = await supabase.from("profiles").select("id, role").eq("email", advisorEmail).maybeSingle();
                  if (!adv || adv.role !== "advisor") {
                    setConnecting(false);
                    return toast.error("לא נמצא יועץ עם האימייל הזה");
                  }
                  const { error } = await supabase.from("advisor_clients").insert({
                    advisor_id: adv.id, client_id: user.id, permission_level: permission, status: "active",
                  });
                  setConnecting(false);
                  if (error) return toast.error("החיבור נכשל", { description: error.message });
                  toast.success("היועץ חובר בהצלחה");
                  setAdvisorEmail("");
                }}
                disabled={connecting}
                className="mt-4 bg-gradient-success shadow-soft"
              >
                {connecting ? "מחבר..." : "חבר יועץ"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="border-border/60 p-6 shadow-soft">
        <h3 className="font-semibold">קטגוריות זמינות</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.key} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
                <Icon className="h-3.5 w-3.5" style={{ color: c.color }} />
                {c.label}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
