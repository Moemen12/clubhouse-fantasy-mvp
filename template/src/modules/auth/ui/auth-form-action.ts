import { hasAuthFieldErrors, validateAuthInput } from "../domain";
import type { AuthFieldErrors, AuthIntent } from "../domain";
import type { AuthClient, AuthUser } from "../ports";

export type AuthActionState = Readonly<{
  status: "idle" | "error" | "success";
  fieldErrors: AuthFieldErrors;
  message: string | null;
  user: AuthUser | null;
}>;

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  fieldErrors: {},
  message: null,
  user: null,
};

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitAuthForm(
  authClient: AuthClient,
  intent: AuthIntent,
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const input = {
    intent,
    email: readFormValue(formData, "email"),
    password: readFormValue(formData, "password"),
    displayName: readFormValue(formData, "displayName"),
  };
  const fieldErrors = validateAuthInput(input);

  if (hasAuthFieldErrors(fieldErrors)) {
    return {
      status: "error",
      fieldErrors,
      message: null,
      user: null,
    };
  }

  const result =
    intent === "sign-up"
      ? await authClient.signUp({
          email: input.email.trim(),
          password: input.password,
          displayName: input.displayName.trim(),
        })
      : await authClient.signIn({
          email: input.email.trim(),
          password: input.password,
        });

  if (result.error) {
    return {
      status: "error",
      fieldErrors: {},
      message: result.error,
      user: null,
    };
  }

  return {
    status: "success",
    fieldErrors: {},
    message: result.message ?? null,
    user: result.user,
  };
}
