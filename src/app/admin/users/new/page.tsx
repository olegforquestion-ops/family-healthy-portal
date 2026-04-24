import { requireAdminSession } from "@/lib/session";
import { CreateUserForm } from "@/components/forms/create-user-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CreateUserPage() {
  await requireAdminSession();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="success">Admin only</Badge>
        <h1 className="font-display text-3xl font-semibold">Создание пользователя</h1>
        <p className="max-w-3xl text-muted-foreground">
          В core-фазе администратор создает пользователя вручную, задает логин, временный пароль, роль и статус. Профиль создается в минимальном виде.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Новая учетная запись</CardTitle>
            <CardDescription>Только самые необходимые поля для MVP.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateUserForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Что происходит после создания</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <div className="rounded-[1.25rem] bg-muted/60 p-4">1. Создается учетная запись пользователя в текущей семье администратора.</div>
            <div className="rounded-[1.25rem] bg-muted/60 p-4">2. Создается базовый профиль с целью по умолчанию.</div>
            <div className="rounded-[1.25rem] bg-muted/60 p-4">3. Пользователь затем заполняет свои данные в разделе профиля.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
