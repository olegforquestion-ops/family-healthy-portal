"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Apple,
  Droplets,
  Dumbbell,
  Flag,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Ruler,
  ShieldCheck,
  UserSquare2,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/modules/auth/actions";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  session: {
    user: {
      id: string;
      name?: string | null;
      login: string;
      role: "ADMIN" | "MEMBER";
      familyId: string;
    };
  } | null;
};

type Role = "ADMIN" | "MEMBER";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
  mobilePrimary?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Сегодня", icon: LayoutDashboard, roles: ["ADMIN", "MEMBER"], mobilePrimary: true },
  { href: "/nutrition", label: "Питание", icon: NotebookPen, roles: ["ADMIN", "MEMBER"], mobilePrimary: true },
  { href: "/water", label: "Вода", icon: Droplets, roles: ["ADMIN", "MEMBER"], mobilePrimary: true },
  { href: "/workouts", label: "Тренировки", icon: Dumbbell, roles: ["ADMIN", "MEMBER"], mobilePrimary: true },
  { href: "/profile", label: "Профиль", icon: UserSquare2, roles: ["ADMIN", "MEMBER"] },
  { href: "/measurements", label: "Вес и замеры", icon: Ruler, roles: ["ADMIN", "MEMBER"] },
  { href: "/foods", label: "База продуктов", icon: Apple, roles: ["ADMIN", "MEMBER"] },
  { href: "/goals", label: "Цели", icon: Flag, roles: ["ADMIN", "MEMBER"] },
  { href: "/family", label: "Семья", icon: Users, roles: ["ADMIN"] },
  { href: "/admin/users", label: "Пользователи", icon: Users, roles: ["ADMIN"] },
  { href: "/admin/users/new", label: "Создать пользователя", icon: ShieldCheck, roles: ["ADMIN"] },
];

function getCurrentSection(pathname: string) {
  const match = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.label ?? "Раздел";
}

export function AppShell({ children, session }: AppShellProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/login")) {
    return <div className="mx-auto min-h-screen max-w-[1920px] px-4 py-6 lg:px-6">{children}</div>;
  }

  const role = session?.user.role ?? "MEMBER";
  const filteredNav = navItems.filter((item) => item.roles.includes(role));
  const mobilePrimaryNav = filteredNav.filter((item) => item.mobilePrimary);
  const mobileSecondaryNav = filteredNav.filter((item) => !item.mobilePrimary);
  const sectionLabel = getCurrentSection(pathname);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1920px] gap-4 px-3 py-3 sm:px-4 sm:py-4 xl:gap-8 xl:px-6">
        <aside className="hidden w-72 shrink-0 flex-col gap-5 xl:flex">
          <div className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(160deg,rgba(8,87,67,0.96),rgba(28,138,106,0.9))] p-6 text-white shadow-soft">
            <div className="space-y-2">
              <p className="font-display text-2xl font-semibold leading-tight">Семейный портал для здорового образа жизни</p>
              <p className="max-w-xs text-sm text-white/75">Ежедневные привычки, питание, вода, тренировки и цели в одном месте.</p>
            </div>
          </div>

          <nav className="rounded-[1.5rem] border border-white/70 bg-card/90 p-3 shadow-soft backdrop-blur">
            <div className="mb-2 px-3 pt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Основные разделы</p>
            </div>
            <div className="space-y-1">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                      active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-36 xl:pb-0">
          <header className="mb-3 rounded-[1.25rem] border border-white/70 bg-card/80 p-3 shadow-soft backdrop-blur sm:mb-5 sm:rounded-[1.5rem] sm:p-4 lg:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-xs sm:tracking-[0.2em]">Текущий раздел</p>
                <p className="font-display text-base font-semibold leading-tight sm:text-xl lg:text-[1.7rem]">{sectionLabel}</p>
                <p className="mt-1 hidden text-sm text-muted-foreground sm:block">На телефоне упор на быстрые действия дня, на десктопе доступен полный рабочий режим.</p>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <Badge className="hidden sm:inline-flex" variant={role === "ADMIN" ? "success" : "secondary"}>
                  {role === "ADMIN" ? "Администратор" : "Пользователь"}
                </Badge>
                <form action={logoutAction}>
                  <Button variant="outline" size="sm" type="submit">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Выйти</span>
                  </Button>
                </form>
              </div>
            </div>
          </header>

          <div className="space-y-5 lg:space-y-6">{children}</div>
        </main>
      </div>

      {mobileSecondaryNav.length ? (
        <div className="fixed inset-x-0 bottom-[4.65rem] z-20 border-t border-white/70 bg-background/92 px-2 py-2 shadow-soft backdrop-blur xl:hidden">
          <div className="mx-auto flex max-w-[760px] gap-2 overflow-x-auto pb-1">
            {mobileSecondaryNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex shrink-0 rounded-full border px-3 py-2 text-sm transition-colors",
                    active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/70 bg-background/95 px-2 py-2 shadow-soft backdrop-blur xl:hidden">
        <div className="mx-auto flex max-w-[760px] items-center justify-between gap-1">
          {mobilePrimaryNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center text-[11px] font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="line-clamp-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
