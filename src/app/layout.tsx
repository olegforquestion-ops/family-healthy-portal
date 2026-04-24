import type { Metadata } from "next";

import "@/app/globals.css";

import { auth } from "@/auth";
import { AppShell } from "@/components/app/app-shell";

export const metadata: Metadata = {
  title: "Family Healthy Lifestyle Portal",
  description: "MVP for family healthy lifestyle tracking.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="ru">
      <body>
        <AppShell
          session={
            session?.user
              ? {
                  user: {
                    id: session.user.id,
                    name: session.user.name,
                    login: session.user.login,
                    role: session.user.role,
                    familyId: session.user.familyId,
                  },
                }
              : null
          }
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
