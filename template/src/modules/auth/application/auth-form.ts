import { parseAuthInput } from "../domain";
import type { AuthClient } from "../ports";
import type { AuthActionState } from "../contracts";

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function invalidState(fieldErrors: AuthActionState["fieldErrors"]): AuthActionState {
  return {
    status: "error",
    fieldErrors,
    message: null,
  };
}

export async function submitAuthForm(
  authClient: AuthClient,
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedInput = parseAuthInput({
    intent: readFormValue(formData, "intent"),
    email: readFormValue(formData, "email"),
    password: readFormValue(formData, "password"),
    displayName: readFormValue(formData, "displayName"),
  });

  if (!parsedInput.success) {
    return invalidState(parsedInput.fieldErrors);
  }

  const input = parsedInput.data;
  const result =
    input.intent === "sign-up"
      ? await authClient.signUp({
          email: input.email,
          password: input.password,
          displayName: input.displayName ?? "",
        })
      : await authClient.signIn({
          email: input.email,
          password: input.password,
        });

  if (result.error) {
    return {
      status: "error",
      fieldErrors: {},
      message: result.error,
    };
  }

  if (!result.user) {
    return {
      status: "error",
      fieldErrors: {},
      message: "Supabase did not return an authenticated user.",
    };
  }

  return {
    status: "success",
    fieldErrors: {},
    message: null,
  };
}
