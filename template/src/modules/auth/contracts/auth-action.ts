export type AuthFieldName = "email" | "password" | "displayName";

export type AuthFieldError = Readonly<{
  type: "server";
  message: string;
}>;

export type AuthFieldErrors = Readonly<Partial<Record<AuthFieldName, AuthFieldError>>>;

export type AuthActionState = Readonly<{
  status: "idle" | "error" | "success";
  fieldErrors: AuthFieldErrors;
  message: string | null;
}>;

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  fieldErrors: {},
  message: null,
};

export type AuthFormAction = (
  previousState: AuthActionState,
  formData: FormData,
) => Promise<AuthActionState>;
