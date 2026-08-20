"use client";

import { useActionState, useEffect, useEffectEvent, useId } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useFormStatus } from "react-dom";

import type { AuthIntent } from "../domain/auth";
import { initialAuthActionState, submitAuthForm } from "./auth-form-action";
import type { AuthClient, AuthUser } from "../ports";
import { Button } from "@/shared/frontend/ui/button";
import { Input } from "@/shared/frontend/ui/input";
import { Label } from "@/shared/frontend/ui/label";

type AuthFormProps = Readonly<{
  authClient: AuthClient;
  intent: AuthIntent;
  onAuthenticated: (user: AuthUser) => void;
}>;

export function AuthForm({ authClient, intent, onAuthenticated }: AuthFormProps) {
  const formId = useId();
  const [state, formAction] = useActionState(
    (previousState: typeof initialAuthActionState, formData: FormData) =>
      submitAuthForm(authClient, intent, previousState, formData),
    initialAuthActionState,
  );
  const handleAuthenticated = useEffectEvent(onAuthenticated);
  const isSignUp = intent === "sign-up";
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  const displayNameId = `${formId}-display-name`;
  const emailErrorId = `${emailId}-error`;
  const passwordErrorId = `${passwordId}-error`;
  const displayNameErrorId = `${displayNameId}-error`;

  useEffect(() => {
    if (state.user) handleAuthenticated(state.user);
  }, [state.user]);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {isSignUp ? (
        <div className="space-y-2">
          <Label htmlFor={displayNameId}>Manager name</Label>
          <Input
            id={displayNameId}
            name="displayName"
            autoComplete="name"
            placeholder="e.g. Marcus Khan"
            aria-invalid={Boolean(state.fieldErrors.displayName)}
            aria-describedby={state.fieldErrors.displayName ? displayNameErrorId : undefined}
          />
          {state.fieldErrors.displayName ? (
            <FieldError id={displayNameErrorId}>{state.fieldErrors.displayName}</FieldError>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={emailId}>Email address</Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(state.fieldErrors.email)}
          aria-describedby={state.fieldErrors.email ? emailErrorId : undefined}
        />
        {state.fieldErrors.email ? (
          <FieldError id={emailErrorId}>{state.fieldErrors.email}</FieldError>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={passwordId}>Password</Label>
          {!isSignUp ? <span className="text-xs text-(--ink-faint)">8+ characters</span> : null}
        </div>
        <Input
          id={passwordId}
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          placeholder="••••••••"
          aria-invalid={Boolean(state.fieldErrors.password)}
          aria-describedby={state.fieldErrors.password ? passwordErrorId : undefined}
        />
        {state.fieldErrors.password ? (
          <FieldError id={passwordErrorId}>{state.fieldErrors.password}</FieldError>
        ) : null}
      </div>

      {state.message && state.status === "error" ? (
        <div
          className="flex items-start gap-2 rounded-xl border border-[rgba(255,131,109,0.25)] bg-[rgba(255,131,109,0.08)] px-3 py-2.75 text-[0.76rem] leading-[1.5] text-[#ffb6a9]"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}
      {state.message && state.status === "success" ? (
        <div
          className="flex items-start gap-2 rounded-xl border border-[rgba(215,255,79,0.2)] bg-[rgba(215,255,79,0.08)] px-3 py-2.75 text-[0.76rem] leading-[1.5] text-[#d9ef9b]"
          role="status"
        >
          <Check className="h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      ) : null}

      <SubmitButton intent={intent} />
    </form>
  );
}

function SubmitButton({ intent }: Readonly<{ intent: AuthIntent }>) {
  const { pending } = useFormStatus();
  const label = pending
    ? intent === "sign-up"
      ? "Creating account…"
      : "Signing in…"
    : intent === "sign-up"
      ? "Create account"
      : "Enter Clubhouse";

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {label}
      {!pending ? <ArrowRight className="h-4 w-4" /> : null}
    </Button>
  );
}

function FieldError({ id, children }: Readonly<{ id: string; children: string }>) {
  return (
    <p id={id} className="text-xs text-(--red)" role="alert">
      {children}
    </p>
  );
}
