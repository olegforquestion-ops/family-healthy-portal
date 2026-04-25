import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/forms/login-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6 xl:gap-8">
      <Card className="overflow-hidden border-none bg-[linear-gradient(160deg,rgba(252,236,197,0.96),rgba(255,255,255,0.9))]">
        <CardContent className="flex min-h-[380px] flex-col justify-between p-5 sm:p-6 md:min-h-[540px] md:p-10">
          <div className="space-y-6">
            <Badge variant="secondary">Core MVP</Badge>
            <div className="space-y-3">
              <h1 className="font-display text-3xl font-semibold text-balance sm:text-4xl md:text-5xl">
                Один вход для всей семейной системы учета.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                В этой фазе подключены только базовые функции MVP: авторизация, роли, создание пользователей администратором,
                профиль, история веса и замеров, а также расчет норм калорий и БЖУ.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-white/70 bg-white/70 p-4">
              <p className="font-semibold">Без саморегистрации</p>
              <p className="mt-2 text-sm text-muted-foreground">Новые учетные записи создает только администратор.</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/70 bg-white/70 p-4">
              <p className="font-semibold">Простой MVP-каркас</p>
              <p className="mt-2 text-sm text-muted-foreground">Только необходимые сущности и минимальный связанный UI.</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/70 bg-white/70 p-4">
              <p className="font-semibold">Дальше по фазам</p>
              <p className="mt-2 text-sm text-muted-foreground">Питание, вода, тренировки, цели и дашборды будут следующими итерациями.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Badge>Вход</Badge>
          <CardTitle className="mt-3 text-2xl">Авторизация</CardTitle>
          <CardDescription>
            Используйте логин и пароль учетной записи, созданной администратором. Bootstrap admin создается через seed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <LoginForm />
          <div className="rounded-[1.25rem] bg-muted p-4 text-sm text-muted-foreground">
            Для первого запуска используйте данные из `.env`, которые попадут в seed bootstrap-администратора.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
