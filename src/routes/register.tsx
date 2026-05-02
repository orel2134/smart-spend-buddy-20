import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "הרשמה — SmartSpend" }] }),
  component: RegisterPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "שם מלא נדרש").max(100),
  email: z.string().trim().email("אימייל לא תקין").max(255),
  password: z.string().min(6, "סיסמה לפחות 6 תווים").max(100),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "הסיסמאות לא תואמות",
  path: ["confirm"],
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: result.data.fullName },
      },
    });
    setLoading(false);
    if (error) {
      if (error.message.includes("already")) {
        toast.error("המשתמש כבר רשום", { description: "נסה להתחבר במקום זאת" });
      } else {
        toast.error("שגיאה ברישום", { description: error.message });
      }
      return;
    }
    toast.success("ברוך הבא ל-SmartSpend!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-[0.05]" />
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">SmartSpend</span>
        </Link>
        <Card className="border-border/60 p-8 shadow-elegant">
          <h1 className="text-2xl font-bold">צור חשבון חדש</h1>
          <p className="mt-1 text-sm text-muted-foreground">חודשיים ניסיון חינם, בלי התחייבות</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא</Label>
              <Input id="fullName" value={form.fullName} onChange={update("fullName")} placeholder="ישראל ישראלי" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input id="password" type="password" value={form.password} onChange={update("password")} placeholder="לפחות 6 תווים" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">אימות סיסמה</Label>
              <Input id="confirm" type="password" value={form.confirm} onChange={update("confirm")} required />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary shadow-soft" disabled={loading}>
              {loading ? "יוצר חשבון..." : "צור חשבון חינם"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            כבר יש לך חשבון?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">התחבר</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
