import { PageHeader } from "@/components/prototype/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pageInventory, proposedAppStructure, screenMap, userFlows } from "@/lib/mock-data";

export default function UxFoundationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Обязательная первая фаза"
        title="UX-основа MVP-прототипа"
        description="На этом экране собраны обязательные артефакты первой фазы по AGENTS.md: карта экранов, пользовательские сценарии, инвентарь страниц и компонентов, а также предлагаемая структура приложения до начала бизнес-логики."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Карта экранов</CardTitle>
            <CardDescription>Все экраны из UX scope, сгруппированные по тому, как пользователь проходит MVP-сценарии.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {screenMap.map((group) => (
              <div key={group.group} className="rounded-[1.25rem] bg-muted/60 p-4">
                <p className="font-semibold">{group.group}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.screens.map((screen) => (
                    <Badge key={screen} variant="secondary">
                      {screen}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Пользовательские сценарии</CardTitle>
            <CardDescription>Короткие MVP-сценарии, оптимизированные под ежедневные действия с минимальным числом кликов.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Badge>Админ</Badge>
              {userFlows.admin.map((flow) => (
                <div key={flow} className="rounded-[1.25rem] bg-muted/60 p-4 text-sm leading-6">
                  {flow}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <Badge variant="success">Пользователь</Badge>
              {userFlows.member.map((flow) => (
                <div key={flow} className="rounded-[1.25rem] bg-muted/60 p-4 text-sm leading-6">
                  {flow}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Инвентарь страниц и компонентов</CardTitle>
            <CardDescription>Общие строительные блоки, которые делают прототип цельным и удобным на мобильных устройствах.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {pageInventory.map((group) => (
              <div key={group.name} className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                <p className="font-semibold">{group.name}</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {group.components.map((component) => (
                    <li key={component}>{component}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Предлагаемая структура приложения</CardTitle>
            <CardDescription>Разделение папок именно для UX-фазы, чтобы моковые данные были изолированы от будущей доменной логики.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {proposedAppStructure.map((item) => (
              <div key={item} className="rounded-[1.25rem] bg-muted/60 p-4 text-sm leading-6">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
