"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bell, ChevronRight, Menu, Sparkles } from "lucide-react";

import type { AppRole } from "@/lib/mock-data";
import { navItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PrototypeShellProps = {
  children: React.ReactNode;
};

export function PrototypeShell({ children }: PrototypeShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as AppRole | null) ?? "admin";
  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  const makeHref = (href: string, nextRole = role) => `${href}?role=${nextRole}`;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside className="hidden w-80 shrink-0 flex-col gap-6 lg:flex">
          <div className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(160deg,rgba(8,87,67,0.96),rgba(28,138,106,0.9))] p-6 text-white shadow-soft">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-xl font-semibold">Семейный портал ЗОЖ</p>
                <p className="text-sm text-white/80">Фаза UX-прототипа</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-white/80">
              Моковый предпросмотр ежедневных MVP-сценариев: питание, вода, тренировки, цели, профиль и семейный обзор.
            </p>
          </div>

          <nav className="rounded-[1.5rem] border border-white/70 bg-card/90 p-3 shadow-soft backdrop-blur">
            <div className="mb-2 px-3 pt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Маршруты прототипа</p>
            </div>
            <div className="space-y-1">
              {filteredNav.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={makeHref(item.href)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                      active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 rounded-[1.5rem] border border-white/70 bg-card/80 p-4 shadow-soft backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                  Меню
                </Button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Фаза 1</p>
                  <p className="font-display text-xl font-semibold">UX и прототип интерфейса</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={role === "admin" ? "success" : "secondary"}>{role === "admin" ? "Просмотр администратора" : "Просмотр пользователя"}</Badge>
                <div className="flex rounded-full border border-border bg-muted p-1">
                  <Link href={makeHref(pathname, "admin")} className={cn("rounded-full px-4 py-2 text-sm font-semibold", role === "admin" ? "bg-card" : "text-muted-foreground")}>
                    Админ
                  </Link>
                  <Link href={makeHref(pathname, "member")} className={cn("rounded-full px-4 py-2 text-sm font-semibold", role === "member" ? "bg-card" : "text-muted-foreground")}>
                    Пользователь
                  </Link>
                </div>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                  Мок-уведомления
                </Button>
              </div>
            </div>
          </header>

          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
