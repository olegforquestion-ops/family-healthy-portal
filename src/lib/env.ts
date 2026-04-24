import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  APP_URL: z.string().url().optional(),
  BOOTSTRAP_ADMIN_LOGIN: z.string().optional(),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().optional(),
  BOOTSTRAP_ADMIN_DISPLAY_NAME: z.string().optional(),
  BOOTSTRAP_FAMILY_NAME: z.string().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  APP_URL: process.env.APP_URL,
  BOOTSTRAP_ADMIN_LOGIN: process.env.BOOTSTRAP_ADMIN_LOGIN,
  BOOTSTRAP_ADMIN_PASSWORD: process.env.BOOTSTRAP_ADMIN_PASSWORD,
  BOOTSTRAP_ADMIN_DISPLAY_NAME: process.env.BOOTSTRAP_ADMIN_DISPLAY_NAME,
  BOOTSTRAP_FAMILY_NAME: process.env.BOOTSTRAP_FAMILY_NAME,
});
