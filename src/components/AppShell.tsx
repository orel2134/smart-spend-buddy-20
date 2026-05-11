import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Receipt, Target, Lightbulb, BarChart3, Bell, Settings, CreditCard,
  Wallet, LogOut, Menu, X, Sparkles, Calculator, Trophy, Users, Mail, Radar, FileBarChart,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PERSONAL_NAV = [
  { to: "/dashboard", label: "דשבורד", icon: LayoutDashboard },
  { to: "/expenses", label: "הוצאות", icon: Receipt },
  { to: "/budget", label: "תקציב", icon: Target },
  { to: "/coach", label: "מאמן AI", icon: Sparkles },
  { to: "/simulator", label: "סימולטור חיסכון", icon: Calculator },
  { to: "/challenges", label: "אתגרי חיסכון", icon: Trophy },
  { to: "/insights", label: "תובנות", icon: Lightbulb },
  { to: "/analytics", label: "ניתוחים", icon: BarChart3 },
  { to: "/recommendations", label: "המלצות יועץ", icon: MessageSquare },
  { to: "/notifications", label: "התראות", icon: Bell },
  { to: "/pricing", label: "תוכניות", icon: CreditCard },
  { to: "/settings", label: "הגדרות", icon: Settings },
] as const;

const ADVISOR_NAV = [
  { to: "/advisor", label: "דשבורד יועץ", icon: LayoutDashboard },
  { to: "/advisor/clients", label: "לקוחות", icon: Users },
  { to: "/advisor/invitations", label: "הזמנת לקוחות", icon: Mail },
  { to: "/advisor/risk-radar", label: "מכ״ם סיכון", icon: Radar },
  { to: "/advisor/recommendations", label: "המלצות", icon: MessageSquare },
  { to: "/advisor/reports", label: "דוחות", icon: FileBarChart },
  { to: "/notifications", label: "התראות", icon: Bell },
  { to: "/settings", label: "הגדרות", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { signOut, user, profile } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const isAdvisor = profile?.role === "advisor";
  const NAV = isAdvisor ? ADVISOR_NAV : PERSONAL_NAV;
  const homeLink = isAdvisor ? "/advisor" : "/dashboard";

  const handleSignOut = async () => {
    await signOut();
    toast.success("התנתקת בהצלחה");
    navigate({ to: "/" });
  };

  const sidebarContent = (
    <>
      <Link to={homeLink} className="flex items-center gap-2 px-2 py-3" onClick={() => setOpen(false)}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <Wallet className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-tight">SmartSpend</span>
          {isAdvisor && <span className="text-[10px] font-medium text-primary">פאנל יועץ</span>}
        </div>
      </Link>
      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = path === item.to || path.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border pt-3">
        <div className="px-2 pb-1 text-xs font-medium truncate">{profile?.full_name ?? user?.email}</div>
        <div className="px-2 pb-2 text-[11px] text-muted-foreground truncate">{user?.email}</div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          התנתק
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
        <Link to={homeLink} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Wallet className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">SmartSpend</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-72 flex-col bg-sidebar p-4 shadow-elegant">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="md:flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-l border-sidebar-border bg-sidebar p-4 md:flex">
          {sidebarContent}
        </aside>

        <main className="flex-1 min-w-0">
          <div className="container mx-auto max-w-6xl px-4 py-6 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
