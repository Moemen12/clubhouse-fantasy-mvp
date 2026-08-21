import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
  z.string().min(1).optional(),
);

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
  z.url().optional(),
);

const clientEnvSchema = z
  .object({
    NEXT_PUBLIC_APP_NAME: z.string().default("Clubhouse"),
    NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalText,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalText,
  })
  .transform((values) => {
    const publishableKey =
      values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? values.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return {
      NEXT_PUBLIC_APP_NAME: values.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_SUPABASE_URL: values.NEXT_PUBLIC_SUPABASE_URL ?? null,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey ?? null,
      supabaseConfigured: Boolean(values.NEXT_PUBLIC_SUPABASE_URL && publishableKey),
    };
  });

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
