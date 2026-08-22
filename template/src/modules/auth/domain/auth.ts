import { z } from "zod";

export const authInputSchema = z
  .object({
    intent: z.enum(["sign-in", "sign-up"]),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .email("Enter a valid email address."),
    password: z.string().min(1, "Enter your password.").min(8, "Use at least 8 characters."),
    displayName: z.string().trim().optional(),
  })
  .superRefine((input, context) => {
    if (input.intent === "sign-up" && !input.displayName) {
      context.addIssue({
        code: "custom",
        path: ["displayName"],
        message: "Choose a manager name.",
      });
    }
  });

export type AuthIntent = "sign-in" | "sign-up";
export type AuthInput = z.input<typeof authInputSchema>;
export type AuthFieldName = "email" | "password" | "displayName";
export type AuthFieldError = Readonly<{
  type: "server";
  message: string;
}>;
export type AuthFieldErrors = Readonly<Partial<Record<AuthFieldName, AuthFieldError>>>;

type AuthParseResult =
  | Readonly<{ success: true; data: AuthInput }>
  | Readonly<{ success: false; fieldErrors: AuthFieldErrors }>;

function toFieldError(message?: string): AuthFieldError | undefined {
  return message ? { type: "server", message } : undefined;
}

export function parseAuthInput(input: unknown): AuthParseResult {
  const result = authInputSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const fieldErrors = result.error.flatten().fieldErrors;
  return {
    success: false,
    fieldErrors: {
      email: toFieldError(fieldErrors.email?.[0]),
      password: toFieldError(fieldErrors.password?.[0]),
      displayName: toFieldError(fieldErrors.displayName?.[0]),
    },
  };
}
