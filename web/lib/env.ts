import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("PRISM"),
  NEXT_PUBLIC_APP_VERSION: z.string().default("0.1.0"),
  NEXT_PUBLIC_API_URL: z.string().default("https://prism-api-z7c9.onrender.com"),
  NEXT_PUBLIC_ENABLE_DEMO_MOCK: z
    .string()
    .default("true")
    .transform((val) => val === "true"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || undefined,
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || undefined,
  NEXT_PUBLIC_ENABLE_DEMO_MOCK: process.env.NEXT_PUBLIC_ENABLE_DEMO_MOCK || undefined,
});
