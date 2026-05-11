import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Wallet, Bell, BarChart3, Sparkles, Check, ArrowLeft, User, Briefcase,
  Brain, Radar, Target,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartSpend — מערכת חכמה לניהול הוצאות אישיות וייעוץ פיננסי" },
      { name: "description", content: "SmartSpend היא מערכת חכמה בענן לניהול הוצאות אישיות, חיזוי חריגות תקציב, וייעוץ פיננסי מקצועי ללקוחות." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">SmartSpend</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#paths" className="hover:text-foreground transition-colors">מסלולים</a>
            <a href="#features" className="hover:text-foreground transition-colors">פיצ'רים</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">מחירים</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/login">התחברות</Link></Button>
            <Button asChild size="sm" className="bg-gradient-primary shadow-soft"><Link to="/register">הרשמה</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-[0.08]" />
        <div className="absolute -top-40 -left-40 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 -z-10 h-[500px] w-[500px] rounded-full bg-success/10 blur-3xl" />

        <div className="container mx-auto px-4 pt-20 pb-16 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>בנוי על AWS Serverless · חודשיים ניסיון חינם</span>
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
            קח שליטה על ההוצאות עם{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">תובנות פיננסיות חכמות</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            SmartSpend עוזרת למשתמשים לעקוב אחרי הוצאות, לזהות חריגות, לנהל תקציב,
            ולקבל התראות יזומות לפני שהן הופכות לבעיה. ליועצים פיננסיים — פאנל שלם לניהול לקוחות.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-glow gap-2">
              <Link to="/register">התחל ניסיון חינם <ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline"><Link to="/login">צפה בדמו</Link></Button>
          </div>
        </div>
      </section>

      {/* 2 user paths */}
      <section id="paths" className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">איזה משתמש אתה?</h2>
          <p className="mt-4 text-muted-foreground">SmartSpend תומכת בשני סוגי משתמשים — בחר את המסלול שמתאים לך.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          <Card className="group relative overflow-hidden border-border/60 bg-gradient-card p-8 shadow-soft transition-all hover:shadow-elegant hover:-translate-y-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <User className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="mt-5 text-2xl font-bold">משתמש פרטי</h3>
            <p className="mt-2 text-sm text-muted-foreground">לאנשים שרוצים לנהל את ההוצאות והתקציב האישי שלהם.</p>
            <ul className="mt-5 space-y-2 text-sm">
              {["מעקב הוצאות וקטגוריות", "ניהול תקציב חודשי ושבועי", "התראות חכמות בזמן אמת", "מאמן AI אישי", "סימולטור חיסכון", "ציון בריאות פיננסית"].map((i) => (
                <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" />{i}</li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full bg-gradient-primary shadow-soft">
              <Link to="/register" search={{ role: "personal" }}>הרשמה כמשתמש פרטי</Link>
            </Button>
          </Card>

          <Card className="group relative overflow-hidden border-border/60 bg-gradient-card p-8 shadow-soft transition-all hover:shadow-elegant hover:-translate-y-1">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-success shadow-glow">
              <Briefcase className="h-7 w-7 text-success-foreground" />
            </div>
            <h3 className="mt-5 text-2xl font-bold">יועץ / מנהל פיננסי</h3>
            <p className="mt-2 text-sm text-muted-foreground">למקצוענים שמלווים מספר לקוחות ורוצים לעקוב, להמליץ ולהתריע.</p>
            <ul className="mt-5 space-y-2 text-sm">
              {["ניהול מספר לקוחות במקום אחד", "מכ״ם סיכון לקוחות", "שליחת המלצות אישיות", "הערות פנימיות לכל לקוח", "דוחות חודשיים", "הזמנת לקוחות חדשים"].map((i) => (
                <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" />{i}</li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full bg-gradient-success shadow-soft">
              <Link to="/register" search={{ role: "advisor" }}>הרשמה כיועץ פיננסי</Link>
            </Button>
          </Card>
        </div>
      </section>

      <section id="features" className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">לא עוד אפליקציית הוצאות — מערכת חכמה</h2>
          <p className="mt-4 text-muted-foreground">המערכת מנתחת התנהגות, מזהה חריגות וממליצה מה לעשות.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            { icon: Brain, title: "מאמן פיננסי AI", desc: "בקש עזרה בעברית פשוטה — קבל המלצות אישיות מבוססות הנתונים שלך." },
            { icon: Radar, title: "מכ״ם סיכון", desc: "ליועצים: זיהוי לקוחות שעומדים לחרוג מהתקציב לפני שזה קורה." },
            { icon: Target, title: "תחזית סוף חודש", desc: "המערכת חוזה לפי קצב ההוצאות האם תחרוג, ומציעה דרכים לחסוך." },
            { icon: Bell, title: "התראות יזומות", desc: "התראות SNS על חריגות, הוצאות חריגות וטרנדים מסוכנים." },
            { icon: BarChart3, title: "ניתוח מגמות", desc: "השוואה אוטומטית בין חודשים, זיהוי קטגוריות בעלייה." },
            { icon: Wallet, title: "תשלומים חוזרים", desc: "המערכת מזהה אוטומטית מנויים והוצאות קבועות." },
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
                <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" />{i}</li>
              ))}
            </ul>
          </Card>
          <Card className="relative border-primary/40 bg-gradient-card p-8 shadow-elegant">
            <div className="absolute -top-3 right-6 rounded-full bg-gradient-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-glow">הכי פופולרי</div>
            <div className="text-sm font-medium text-primary">פרימיום</div>
            <div className="mt-2 text-4xl font-bold">₪10<span className="text-base font-normal text-muted-foreground">/חודש</span></div>
            <div className="text-sm text-muted-foreground">ללא התחייבות</div>
            <ul className="mt-6 space-y-3 text-sm">
              {["כל מה שיש בחינם", "מאמן AI אישי", "סימולטור חיסכון", "המלצות מותאמות", "דוחות מתקדמים"].map((i) => (
                <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" />{i}</li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full bg-gradient-primary shadow-soft"><Link to="/register">התחל ניסיון חינם</Link></Button>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SmartSpend · בנוי על AWS Serverless (S3, CloudFront, Cognito, API Gateway, Lambda, DynamoDB, Step Functions, SNS, EventBridge)
        </div>
      </footer>
    </div>
  );
}
