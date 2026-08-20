"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Check, LockKeyhole, Sparkles } from "lucide-react";

import { validateAuthInput, hasAuthFieldErrors } from "../domain/auth";
import type { AuthFieldErrors, AuthIntent } from "../domain/auth";
import type { AuthClient, AuthUser } from "../ports";
import { Badge } from "@/shared/frontend/ui/badge";
import { Button } from "@/shared/frontend/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/frontend/ui/card";
import { Input } from "@/shared/frontend/ui/input";
import { Label } from "@/shared/frontend/ui/label";
import { Separator } from "@/shared/frontend/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/frontend/ui/tabs";

type AuthEntryProps = Readonly<{
  authClient: AuthClient;
  onAuthenticated: (user: AuthUser) => void;
}>;

type FormState = Readonly<{
  email: string;
  password: string;
  displayName: string;
}>;

const initialForm: FormState = {
  email: "",
  password: "",
  displayName: "",
};

export function AuthEntry({ authClient, onAuthenticated }: AuthEntryProps) {
  const [intent, setIntent] = useState<AuthIntent>("sign-in");
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = intent === "sign-up";
  const buttonLabel = useMemo(() => {
    if (isSubmitting) return isSignUp ? "Creating account…" : "Signing in…";
    return isSignUp ? "Create account" : "Enter Clubhouse";
  }, [isSignUp, isSubmitting]);

  function handleIntentChange(value: string) {
    setIntent(value as AuthIntent);
    setErrors({});
    setRequestError(null);
    setNotice(null);
  }

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setRequestError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setRequestError(null);

    const nextErrors = validateAuthInput({ ...form, intent });
    setErrors(nextErrors);
    if (hasAuthFieldErrors(nextErrors)) return;

    setIsSubmitting(true);
    const result = isSignUp
      ? await authClient.signUp({
          email: form.email.trim(),
          password: form.password,
          displayName: form.displayName.trim(),
        })
      : await authClient.signIn({ email: form.email.trim(), password: form.password });
    setIsSubmitting(false);

    if (result.error) {
      setRequestError(result.error);
      return;
    }
    if (result.message) setNotice(result.message);
    if (result.user) onAuthenticated(result.user);
  }

  return (
    <main className="auth-screen">
      <section className="auth-story" aria-labelledby="auth-story-title">
        <div className="brand-lockup auth-brand">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>
            <span className="brand-name">clubhouse</span>
            <span className="brand-caption">Fantasy football, reimagined.</span>
          </span>
        </div>

        <div className="auth-story-copy">
          <Badge variant="success" className="w-fit">
            <Sparkles className="mr-1.5 h-3 w-3" />
            Season 01 · First light
          </Badge>
          <p className="section-kicker mt-8">
            <span className="kicker-line" /> Your match-day workspace
          </p>
          <h1 id="auth-story-title">Make your move count.</h1>
          <p>
            Build a squad with a point of view, make one decision that matters, and see exactly why
            your instincts put you ahead.
          </p>
        </div>

        <div className="auth-story-footer">
          <div className="auth-story-stat">
            <strong>01</strong>
            <span>focused gameweek</span>
          </div>
          <div className="auth-story-stat">
            <strong>2×</strong>
            <span>captain&apos;s edge</span>
          </div>
          <div className="auth-story-stat">
            <strong>∞</strong>
            <span>ways to play</span>
          </div>
        </div>
      </section>

      <section className="auth-form-wrap" aria-label="Account access">
        <Card className="auth-card">
          <CardHeader className="gap-3 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="auth-card-icon">
                <LockKeyhole className="h-4 w-4" />
              </div>
              <Badge variant={authClient.mode === "supabase" ? "success" : "secondary"}>
                {authClient.mode === "supabase" ? "Live accounts" : "Preview mode"}
              </Badge>
            </div>
            <div>
              <CardTitle>Welcome to Clubhouse</CardTitle>
              <CardDescription className="mt-2">
                {authClient.mode === "supabase"
                  ? "Sign in to keep your squad, decisions, and results with you."
                  : "Explore the product now. Connect Supabase later for real accounts."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={intent} onValueChange={handleIntentChange}>
              <TabsList aria-label="Authentication mode">
                <TabsTrigger value="sign-in">Sign in</TabsTrigger>
                <TabsTrigger value="sign-up">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="sign-in">
                <AuthForm
                  intent="sign-in"
                  form={form}
                  errors={errors}
                  requestError={requestError}
                  notice={notice}
                  isSubmitting={isSubmitting}
                  buttonLabel={buttonLabel}
                  onFieldChange={updateField}
                  onSubmit={handleSubmit}
                />
              </TabsContent>

              <TabsContent value="sign-up">
                <AuthForm
                  intent="sign-up"
                  form={form}
                  errors={errors}
                  requestError={requestError}
                  notice={notice}
                  isSubmitting={isSubmitting}
                  buttonLabel={buttonLabel}
                  onFieldChange={updateField}
                  onSubmit={handleSubmit}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex items-center gap-3 text-xs text-[var(--ink-faint)]">
              <Separator className="flex-1" />
              <span>Your data stays yours</span>
              <Separator className="flex-1" />
            </div>
          </CardContent>
        </Card>
        <p className="auth-form-note">
          No pressure. Preview mode is available while the product is taking shape.
        </p>
      </section>
    </main>
  );
}

type AuthFormProps = Readonly<{
  intent: AuthIntent;
  form: FormState;
  errors: AuthFieldErrors;
  requestError: string | null;
  notice: string | null;
  isSubmitting: boolean;
  buttonLabel: string;
  onFieldChange: (field: keyof FormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}>;

function AuthForm({
  intent,
  form,
  errors,
  requestError,
  notice,
  isSubmitting,
  buttonLabel,
  onFieldChange,
  onSubmit,
}: AuthFormProps) {
  const isSignUp = intent === "sign-up";
  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {isSignUp ? (
        <div className="space-y-2">
          <Label htmlFor="display-name">Manager name</Label>
          <Input
            id="display-name"
            autoComplete="name"
            placeholder="e.g. Marcus Khan"
            value={form.displayName}
            onChange={(event) => onFieldChange("displayName", event.target.value)}
            aria-invalid={Boolean(errors.displayName)}
            aria-describedby={errors.displayName ? "display-name-error" : undefined}
          />
          {errors.displayName ? (
            <FieldError id="display-name-error">{errors.displayName}</FieldError>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${intent}-email`}>Email address</Label>
        <Input
          id={`${intent}-email`}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${intent}-email-error` : undefined}
        />
        {errors.email ? <FieldError id={`${intent}-email-error`}>{errors.email}</FieldError> : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`${intent}-password`}>Password</Label>
          {!isSignUp ? (
            <span className="text-xs text-[var(--ink-faint)]">8+ characters</span>
          ) : null}
        </div>
        <Input
          id={`${intent}-password`}
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          placeholder="••••••••"
          value={form.password}
          onChange={(event) => onFieldChange("password", event.target.value)}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? `${intent}-password-error` : undefined}
        />
        {errors.password ? (
          <FieldError id={`${intent}-password-error`}>{errors.password}</FieldError>
        ) : null}
      </div>

      {requestError ? <div className="auth-message auth-message-error">{requestError}</div> : null}
      {notice ? (
        <div className="auth-message auth-message-success">
          <Check className="h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {buttonLabel}
        {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>
    </form>
  );
}

function FieldError({ id, children }: Readonly<{ id: string; children: string }>) {
  return (
    <p id={id} className="text-xs text-[var(--red)]" role="alert">
      {children}
    </p>
  );
}
