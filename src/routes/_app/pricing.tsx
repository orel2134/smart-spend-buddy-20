import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Gift } from "lucide-react";

export const Route = createFileRoute("/_app/pricing")({
  head: () => ({ meta: [{ title: "תוכניות — SmartSpend" }] }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">בחר את התוכנית המתאימה לך</h1>
        <p className="mt-2 text-muted-foreground">חודשיים ניסיון חינם. בלי כרטיס אשראי, בלי התחייבות.</p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        <Card className="border-border/60 p-8 shadow-soft">
          <div className="text-sm font-medium text-muted-foreground">תקופת ניסיון</div>
          <div className="mt-2 text-4xl font-bold">חינם</div>
          <div className="text-sm text-muted-foreground">למשך 60 ימים</div>
          <ul className="mt-6 space-y-3 text-sm">
            {["מעקב הוצאות מלא", "תקציבים חודשיים", "גרפים בסיסיים", "התראות תקציב"].map((i) => (
              <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {i}</li>
            ))}
          </ul>
          <Button variant="outline" className="mt-6 w-full" disabled>הניסיון פעיל</Button>
        </Card>

        <Card className="relative border-primary/40 bg-gradient-card p-8 shadow-elegant">
          <div className="absolute -top-3 right-6 rounded-full bg-gradient-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-glow">
            הכי פופולרי
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" /> פרימיום
          </div>
          <div className="mt-2 text-4xl font-bold">₪10<span className="text-base font-normal text-muted-foreground">/חודש</span></div>
          <div className="text-sm text-muted-foreground">ללא התחייבות, ניתן לבטל בכל עת</div>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "כל מה שבחינם",
              "תובנות חכמות מותאמות אישית",
              "המלצות פיננסיות מבוססות AI",
              "דוחות מתקדמים וייצוא נתונים",
              "מעקב מפורט לפי קטגוריות",
              "תמיכה מועדפת",
            ].map((i) => (
              <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {i}</li>
            ))}
          </ul>
          <Button className="mt-6 w-full bg-gradient-primary shadow-soft">שדרג לפרימיום</Button>
        </Card>
      </div>

      <Card className="mx-auto max-w-3xl border-success/30 bg-success/5 p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-success shadow-soft">
            <Gift className="h-6 w-6 text-success-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">תוכנית הפניית חברים</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              הזמן חבר ל-SmartSpend וקבל <strong className="text-success">50% הנחה לחודש הבא</strong> — שניכם מרוויחים.
            </p>
            <Button variant="outline" className="mt-3" size="sm">העתק לינק הפניה</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
