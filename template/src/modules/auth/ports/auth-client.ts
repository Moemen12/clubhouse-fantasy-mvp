export type AuthUser = Readonly<{
  id: string;
  email: string;
  displayName: string;
}>;

export type AuthResult = Readonly<{
  user: AuthUser | null;
  message?: string;
  error?: string;
}>;

export interface AuthClient {
  signIn(input: Readonly<{ email: string; password: string }>): Promise<AuthResult>;
  signUp(
    input: Readonly<{ email: string; password: string; displayName: string }>,
  ): Promise<AuthResult>;
  signOut(): Promise<void>;
}
