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
            <Badge variant="secondary">Family Healthy Portal</Badge>
            <div className="space-y-3">
              <h1 className="font-display text-3xl font-semibold text-balance sm:text-4xl md:text-5xl">
                Один вход для всей семейной системы заботы о здоровье.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                Портал помогает вести питание, воду, тренировки, вес, замеры и личные цели в одном месте. У каждого
                члена семьи свой профиль, а у администратора есть удобный обзор общей картины.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-white/70 bg-white/70 p-4">
              <p className="font-semibold">Ежедневные записи</p>
              <p className="mt-2 text-sm text-muted-foreground">Быстро фиксируйте питание, воду, тренировки, вес и замеры.</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/70 bg-white/70 p-4">
              <p className="font-semibold">Личный прогресс</p>
              <p className="mt-2 text-sm text-muted-foreground">Следите за динамикой показателей и выполнением целей за выбранный период.</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/70 bg-white/70 p-4">
              <p className="font-semibold">Семейный обзор</p>
              <p className="mt-2 text-sm text-muted-foreground">Администратор видит сводную картину по участникам и ключевым привычкам.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Badge>Вход</Badge>
          <CardTitle className="mt-3 text-2xl">Авторизация</CardTitle>
          <CardDescription>
            Используйте свой логин и пароль, чтобы открыть личный кабинет и продолжить работу с записями и аналитикой.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <LoginForm />
          <div className="rounded-[1.25rem] bg-muted p-4 text-sm text-muted-foreground">
            Если вам нужен доступ, обратитесь к администратору вашего семейного пространства.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
