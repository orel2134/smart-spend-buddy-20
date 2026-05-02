import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Bell, BarChart3, Sparkles, Check, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartSpend — נהל את ההוצאות שלך בצורה חכמה" },
      { name: "description", content: "SmartSpend עוזר לך לעקוב אחר הוצאות, להבין הרגלי קנייה, לזהות חריגות ולהישאר בתקציב." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">SmartSpend</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">פיצ'רים</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">מחירים</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">התחברות</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-primary shadow-soft">
              <Link to="/register">הרשמה</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-[0.08]" />
        <div className="absolute -top-40 -right-40 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 -z-10 h-[500px] w-[500px] rounded-full bg-success/10 blur-3xl" />

        <div className="container mx-auto px-4 pt-20 pb-24 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>חודשיים ניסיון חינם — ללא כרטיס אשראי</span>
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
            נהל את ההוצאות שלך{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">בצורה חכמה</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            SmartSpend עוזר לך לעקוב אחר הוצאות, להבין הרגלי קנייה,
            לזהות חריגות בזמן אמת ולהישאר בתקציב — בלי לחשוב על זה.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-glow gap-2">
              <Link to="/register">
                התחל ניסיון חינם
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">צפה בדמו</Link>
            </Button>
          </div>

          {/* Mock dashboard preview */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-primary opacity-20 blur-2xl" />
            <Card className="overflow-hidden border-border/50 bg-card/80 p-2 shadow-elegant backdrop-blur">
              <div className="rounded-2xl bg-gradient-card p-6 md:p-8">
                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    { label: "הוצאות החודש", value: "₪4,250", trend: "+8%" },
                    { label: "נותר בתקציב", value: "₪1,750", trend: "29%" },
                    { label: "קטגוריה מובילה", value: "מזון", trend: "₪1,200" },
                    { label: "התראה חכמה", value: "1 חדשה", trend: "תקציב" },
                  ].map((c) => (
                    <div key={c.label} className="rounded-xl border border-border/40 bg-card p-4 text-right">
                      <div className="text-xs text-muted-foreground">{c.label}</div>
                      <div className="mt-2 text-2xl font-bold">{c.value}</div>
                      <div className="mt-1 text-xs text-success">{c.trend}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">כל מה שצריך כדי לשלוט בכסף</h2>
          <p className="mt-4 text-muted-foreground">שלושה כלים פשוטים שייקחו אותך לרמה הבאה של ניהול פיננסי.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            { icon: Wallet, title: "מעקב הוצאות חכם", desc: "הזן הוצאות בלחיצה אחת, סווג אוטומטית וקבל תמונת מצב מלאה." },
            { icon: Bell, title: "התראות תקציב", desc: "קבל התראה לפני שאתה חורג, ולא אחרי. בלי הפתעות." },
            { icon: BarChart3, title: "תובנות ויזואליות", desc: "גרפים ברורים שמראים לאן הכסף הולך וכיצד לשפר." },
          ].map((f) => (
            <Card key={f.title} className="group border-border/60 bg-gradient-card p-6 shadow-soft transition-all hover:shadow-elegant hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">תמחור פשוט והוגן</h2>
          <p className="mt-4 text-muted-foreground">חודשיים ניסיון חינם, ולאחר מכן רק 10₪ לחודש.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          <Card className="border-border/60 p-8 shadow-soft">
            <div className="text-sm font-medium text-muted-foreground">חינם לחלוטין</div>
            <div className="mt-2 text-4xl font-bold">₪0</div>
            <div className="text-sm text-muted-foreground">למשך 60 ימים</div>
            <ul className="mt-6 space-y-3 text-sm">
              {["מעקב הוצאות מלא", "תקציב חודשי", "גרפים בסיסיים", "התראות"].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" /> {i}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="relative border-primary/40 bg-gradient-card p-8 shadow-elegant">
            <div className="absolute -top-3 right-6 rounded-full bg-gradient-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-glow">
              הכי פופולרי
            </div>
            <div className="text-sm font-medium text-primary">פרימיום</div>
            <div className="mt-2 text-4xl font-bold">₪10<span className="text-base font-normal text-muted-foreground">/חודש</span></div>
            <div className="text-sm text-muted-foreground">ללא התחייבות</div>
            <ul className="mt-6 space-y-3 text-sm">
              {["כל מה שיש בחינם", "תובנות חכמות מותאמות", "המלצות אישיות", "דוחות מתקדמים", "מעקב לפי קטגוריות"].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" /> {i}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full bg-gradient-primary shadow-soft">
              <Link to="/register">התחל ניסיון חינם</Link>
            </Button>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SmartSpend. כל הזכויות שמורות.
        </div>
      </footer>
    </div>
  );
}
