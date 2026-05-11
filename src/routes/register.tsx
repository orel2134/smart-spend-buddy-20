import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, User, Briefcase, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Role = "personal" | "advisor";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "הרשמה — SmartSpend" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    role: (s.role === "advisor" ? "advisor" : "personal") as Role,
  }),
  component: RegisterPage,
});

const baseSchema = z.object({
  fullName: z.string().trim().min(2, "שם מלא נדרש").max(100),
  email: z.string().trim().email("אימייל לא תקין").max(255),
  password: z.string().min(6, "סיסמה לפחות 6 תווים").max(100),
  confirm: z.string(),
});

function RegisterPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>(search.role);
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirm: "",
    monthlyBudget: "", businessName: "", roleTitle: "", phone: "", expectedClients: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const base = baseSchema.safeParse(form);
    if (!base.success) return toast.error(base.error.issues[0].message);
    if (form.password !== form.confirm) return toast.error("הסיסמאות לא תואמות");

    setLoading(true);
    const homeRoute = role === "advisor" ? "/advisor" : "/dashboard";
    const { error } = await supabase.auth.signUp({
      email: base.data.email,
      password: base.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}${homeRoute}`,
        data: {
          full_name: base.data.fullName,
          role,
          monthly_budget: form.monthlyBudget || "",
          business_name: form.businessName,
          role_title: form.roleTitle,
          phone: form.phone,
          expected_clients: form.expectedClients || "",
        },
      },
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("already")) toast.error("המשתמש כבר רשום", { description: "נסה להתחבר במקום זאת" });
      else toast.error("שגיאה ברישום", { description: error.message });
      return;
    }
    toast.success("ברוך הבא ל-SmartSpend!");
    navigate({ to: homeRoute });
  };

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-[0.05]" />
      <div className="w-full max-w-2xl">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">SmartSpend</span>
        </Link>

        <Card className="border-border/60 p-6 md:p-8 shadow-elegant">
          <h1 className="text-2xl font-bold">צור חשבון חדש</h1>
          <p className="mt-1 text-sm text-muted-foreground">בחר את סוג החשבון שמתאים לך</p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <RoleCard active={role === "personal"} onClick={() => setRole("personal")} icon={User} title="משתמש פרטי" desc="ניהול הוצאות ותקציב אישי" />
            <RoleCard active={role === "advisor"} onClick={() => setRole("advisor")} icon={Briefcase} title="יועץ פיננסי" desc="ניהול לקוחות ומתן ייעוץ" />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="שם מלא" id="fullName" value={form.fullName} onChange={update("fullName")} required />
            <Field label="אימייל" id="email" type="email" value={form.email} onChange={update("email")} required />
            <Field label="סיסמה" id="password" type="password" value={form.password} onChange={update("password")} required />
            <Field label="אימות סיסמה" id="confirm" type="password" value={form.confirm} onChange={update("confirm")} required />

            {role === "personal" && (
              <Field label="תקציב חודשי (₪)" id="monthlyBudget" type="number" value={form.monthlyBudget} onChange={update("monthlyBudget")} placeholder="6000" />
            )}

            {role === "advisor" && (
              <>
                <Field label="שם העסק / ארגון" id="businessName" value={form.businessName} onChange={update("businessName")} />
                <Field label="תפקיד" id="roleTitle" value={form.roleTitle} onChange={update("roleTitle")} placeholder="יועץ פיננסי" />
                <Field label="טלפון" id="phone" value={form.phone} onChange={update("phone")} />
                <Field label="מספר לקוחות צפוי" id="expectedClients" type="number" value={form.expectedClients} onChange={update("expectedClients")} placeholder="10" />
              </>
            )}

            <div className="md:col-span-2">
              <Button type="submit" className={cn("w-full shadow-soft", role === "advisor" ? "bg-gradient-success" : "bg-gradient-primary")} disabled={loading}>
                {loading ? "יוצר חשבון..." : `צור חשבון ${role === "advisor" ? "יועץ" : "אישי"}`}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            כבר יש לך חשבון? <Link to="/login" className="font-medium text-primary hover:underline">התחבר</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, icon: Icon, title, desc }: { active: boolean; onClick: () => void; icon: typeof User; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick} className={cn(
      "flex items-center gap-3 rounded-xl border p-4 text-right transition-all",
      active ? "border-primary bg-primary/5 shadow-soft" : "border-border hover:border-primary/40"
    )}>
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", active ? "bg-gradient-primary" : "bg-muted")}>
        <Icon className={cn("h-5 w-5", active ? "text-primary-foreground" : "text-muted-foreground")} />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      {active && <Check className="h-4 w-4 text-primary" />}
    </button>
  );
}

function Field({ label, id, ...props }: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}
