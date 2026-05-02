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

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "התחברות — SmartSpend" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("אימייל לא תקין").max(255),
  password: z.string().min(6, "סיסמה חייבת להיות לפחות 6 תווים").max(100),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(result.data);
    setLoading(false);
    if (error) {
      toast.error("שגיאת התחברות", { description: "אימייל או סיסמה שגויים" });
      return;
    }
    toast.success("ברוך הבא!");
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
          <h1 className="text-2xl font-bold">ברוך שובך</h1>
          <p className="mt-1 text-sm text-muted-foreground">התחבר כדי להמשיך לדשבורד שלך</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary shadow-soft" disabled={loading}>
              {loading ? "מתחבר..." : "התחבר"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            אין לך חשבון?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">הירשם</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
