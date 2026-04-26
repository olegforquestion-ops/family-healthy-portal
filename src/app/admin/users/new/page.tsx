import { CreateUserForm } from "@/components/forms/create-user-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminSession } from "@/lib/session";

export default async function CreateUserPage() {
  await requireAdminSession();

  return (
    <div className="space-y-6">
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
