export type AuthIntent = "sign-in" | "sign-up";

export type AuthInput = Readonly<{
  intent: AuthIntent;
  email: string;
  password: string;
  displayName?: string;
}>;

export type AuthFieldErrors = Readonly<{
  email?: string;
  password?: string;
  displayName?: string;
}>;

export function validateAuthInput(input: AuthInput): AuthFieldErrors {
  const errors: { email?: string; password?: string; displayName?: string } = {};
  const email = input.email.trim();

  if (!email) {
    errors.email = "Enter your email address.";
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!input.password) {
    errors.password = "Enter your password.";
  } else if (input.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  if (input.intent === "sign-up" && !input.displayName?.trim()) {
    errors.displayName = "Choose a manager name.";
  }

  return errors;
}

export function hasAuthFieldErrors(errors: AuthFieldErrors): boolean {
  return Boolean(errors.email || errors.password || errors.displayName);
}
