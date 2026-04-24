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

import { logoutAction } from "@/modules/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const navItems = [
  { href: "/dashboard", label: "Главная", icon: LayoutDashboard, roles: ["ADMIN", "MEMBER"] as const },
  { href: "/profile", label: "Профиль", icon: UserSquare2, roles: ["ADMIN", "MEMBER"] as const },
  { href: "/measurements", label: "Вес и замеры", icon: Ruler, roles: ["ADMIN", "MEMBER"] as const },
  { href: "/foods", label: "База продуктов", icon: Apple, roles: ["ADMIN", "MEMBER"] as const },
  { href: "/nutrition", label: "Дневник питания", icon: NotebookPen, roles: ["ADMIN", "MEMBER"] as const },
  { href: "/water", label: "Вода", icon: Droplets, roles: ["ADMIN", "MEMBER"] as const },
  { href: "/workouts", label: "Тренировки", icon: Dumbbell, roles: ["ADMIN", "MEMBER"] as const },
  { href: "/goals", label: "Цели", icon: Flag, roles: ["ADMIN", "MEMBER"] as const },
  { href: "/family", label: "Семья", icon: Users, roles: ["ADMIN"] as const },
  { href: "/admin/users", label: "Пользователи", icon: Users, roles: ["ADMIN"] as const },
  { href: "/admin/users/new", label: "Создать пользователя", icon: ShieldCheck, roles: ["ADMIN"] as const },
];

export function AppShell({ children, session }: AppShellProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/login")) {
    return <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-6 lg:px-6">{children}</div>;
  }

  const role = session?.user.role ?? "MEMBER";
  const filteredNav = navItems.filter((item) => item.roles.some((itemRole) => itemRole === role));

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside className="hidden w-80 shrink-0 flex-col gap-6 lg:flex">
          <div className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(160deg,rgba(8,87,67,0.96),rgba(28,138,106,0.9))] p-6 text-white shadow-soft">
            <div className="space-y-2">
              <p className="font-display text-xl font-semibold">Семейный портал для здорового образа жизни</p>
            </div>
          </div>

          <nav className="rounded-[1.5rem] border border-white/70 bg-card/90 p-3 shadow-soft backdrop-blur">
            <div className="mb-2 px-3 pt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Основные разделы</p>
            </div>
            <div className="space-y-1">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

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

        <main className="min-w-0 flex-1">
          <header className="mb-6 rounded-[1.5rem] border border-white/70 bg-card/80 p-4 shadow-soft backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Текущий раздел</p>
                <p className="font-display text-xl font-semibold">Ваши привычки, цели и общая картина дня</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={role === "ADMIN" ? "success" : "secondary"}>
                  {role === "ADMIN" ? "Администратор" : "Пользователь"}
                </Badge>
                <div className="rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
                  {session?.user.name || session?.user.login}
                </div>
                <form action={logoutAction}>
                  <Button variant="outline" size="sm" type="submit">
                    <LogOut className="h-4 w-4" />
                    Выйти
                  </Button>
                </form>
              </div>
            </div>
          </header>

          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
