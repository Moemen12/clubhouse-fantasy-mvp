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

export type AuthFieldErrors = Readonly<{
  email?: string;
  password?: string;
  displayName?: string;
}>;

export function validateAuthInput(input: AuthInput): AuthFieldErrors {
  const result = authInputSchema.safeParse(input);

  if (result.success) {
    return {};
  }

  const fieldErrors = result.error.flatten().fieldErrors;
  return {
    email: fieldErrors.email?.[0],
    password: fieldErrors.password?.[0],
    displayName: fieldErrors.displayName?.[0],
  };
}

export function hasAuthFieldErrors(errors: AuthFieldErrors): boolean {
  return Boolean(errors.email || errors.password || errors.displayName);
}
