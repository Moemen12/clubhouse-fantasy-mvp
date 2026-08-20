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

const brandMark =
  "relative inline-flex h-[26px] w-[26px] shrink-0 rotate-[-8deg] items-center justify-center rounded-[8px_8px_8px_2px] border border-[var(--lime)] before:absolute before:left-[5px] before:top-[5px] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[var(--lime)] before:content-[''] after:absolute after:bottom-[5px] after:right-[5px] after:h-[5px] after:w-[5px] after:rounded-full after:bg-[var(--lime)] after:content-['']";

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
    <main className="grid min-h-screen grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] bg-[radial-gradient(circle_at_13%_18%,rgba(215,255,79,0.08),transparent_26rem),radial-gradient(circle_at_85%_84%,rgba(145,184,255,0.08),transparent_22rem),var(--deep)] max-[900px]:block">
      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden border-r border-[var(--line)] p-[clamp(28px,5vw,72px)] before:absolute before:bottom-[-19vw] before:right-[-16vw] before:h-[54vw] before:w-[54vw] before:rounded-full before:border before:border-[rgba(215,255,79,0.13)] before:shadow-[0_0_0_80px_rgba(215,255,79,0.025),0_0_0_160px_rgba(215,255,79,0.02)] before:content-[''] after:absolute after:bottom-[17%] after:right-[20%] after:h-[120px] after:w-0.5 after:rotate-[35deg] after:bg-gradient-to-b after:from-[var(--lime)] after:to-transparent after:opacity-35 after:content-[''] max-[900px]:min-h-0 max-[900px]:border-b max-[900px]:border-r-0 max-[900px]:px-6 max-[900px]:py-[30px] max-[900px]:pb-[46px] max-[520px]:px-[18px] max-[520px]:pb-[34px]"
        aria-labelledby="auth-story-title"
      >
        <div className="relative z-[1] flex items-center gap-2.5">
          <span className={brandMark} aria-hidden="true">
            <span className="absolute left-[10px] top-[10px] h-[5px] w-[5px] rounded-full bg-[var(--lime)]" />
          </span>
          <span>
            <span className="block text-[1.28rem] font-extrabold tracking-[-0.06em]">
              clubhouse
            </span>
            <span className="mt-1.5 block text-[0.7rem] text-[var(--ink-faint)]">
              Fantasy football, reimagined.
            </span>
          </span>
        </div>

        <div className="relative z-[1] max-w-[620px] py-[8vh] max-[900px]:py-[70px_0_50px] max-[520px]:py-[54px_0_40px]">
          <Badge variant="success" className="w-fit">
            <Sparkles className="mr-1.5 h-3 w-3" />
            Season 01 · First light
          </Badge>
          <p className="mt-8 flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            <span className="inline-block h-px w-8 bg-[var(--lime)] opacity-80" /> Your match-day
            workspace
          </p>
          <h1
            className="mt-[18px] max-w-[8ch] text-[clamp(4.3rem,8vw,8.8rem)] font-bold leading-[0.84] tracking-[-0.1em] max-[900px]:text-[clamp(4rem,15vw,7rem)] max-[520px]:text-[clamp(3.7rem,18vw,5.8rem)]"
            id="auth-story-title"
          >
            Make your move count.
          </h1>
          <p className="mt-[30px] max-w-[460px] text-base leading-[1.75] text-[var(--ink-muted)]">
            Build a squad with a point of view, make one decision that matters, and see exactly why
            your instincts put you ahead.
          </p>
        </div>

        <div className="relative z-[1] grid max-w-[520px] grid-cols-3 gap-5 max-[520px]:gap-3">
          {[
            ["01", "focused gameweek"],
            ["2×", "captain's edge"],
            ["∞", "ways to play"],
          ].map(([value, label]) => (
            <div
              className="flex flex-col gap-1.5 border-t border-[var(--line-strong)] pt-3"
              key={label}
            >
              <strong className="text-[1.25rem] font-medium tracking-[-0.05em] text-[var(--lime)]">
                {value}
              </strong>
              <span className="text-[0.64rem] font-bold uppercase tracking-[0.1em] text-[var(--ink-faint)] max-[520px]:text-[0.55rem] max-[520px]:tracking-[0.06em]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="flex min-h-screen flex-col items-center justify-center p-[34px] max-[900px]:min-h-0 max-[900px]:px-6 max-[900px]:py-11 max-[520px]:px-[18px] max-[520px]:py-[34px]"
        aria-label="Account access"
      >
        <Card className="w-full max-w-[470px]">
          <CardHeader className="gap-3 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="grid h-[38px] w-[38px] place-items-center rounded-xl border border-[rgba(215,255,79,0.22)] bg-[rgba(215,255,79,0.1)] text-[var(--lime)]">
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
        <p className="mt-[18px] w-full max-w-[470px] text-center text-[0.68rem] leading-[1.6] text-[var(--ink-faint)]">
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
      {requestError ? (
        <div className="flex items-start gap-2 rounded-xl border border-[rgba(255,131,109,0.25)] bg-[rgba(255,131,109,0.08)] px-3 py-[11px] text-[0.76rem] leading-[1.5] text-[#ffb6a9]">
          {requestError}
        </div>
      ) : null}
      {notice ? (
        <div className="flex items-start gap-2 rounded-xl border border-[rgba(215,255,79,0.2)] bg-[rgba(215,255,79,0.08)] px-3 py-[11px] text-[0.76rem] leading-[1.5] text-[#d9ef9b]">
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
