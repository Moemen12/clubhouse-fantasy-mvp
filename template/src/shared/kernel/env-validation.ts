import { z } from "zod";

const requiredEnvironmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SUPABASE_URL: z.url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL."),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .trim()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required."),
});

export type RequiredEnvironment = z.output<typeof requiredEnvironmentSchema>;

export function validateEnv(environment: NodeJS.ProcessEnv = process.env): RequiredEnvironment {
  return requiredEnvironmentSchema.parse({
    NODE_ENV: environment.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: environment.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

export function formatEnvValidationError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues.map(({ message, path }) => `${path.join(".")}: ${message}`).join("\n");
  }
  if (error instanceof Error) {
    return error.message;
  }
  try {
    return JSON.stringify(error) ?? "Unknown error";
  } catch {
    return "Unknown error";
  }
}
