import { startTransition, useActionState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
import { useForm } from "react-hook-form";

import { authInputSchema } from "../domain";
import type { AuthInput, AuthIntent } from "../domain";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/shared/frontend/ui";
import { initialAuthActionState, submitAuthForm } from "./auth-form-action";
import { createAuthClient } from "./auth-client";

type AuthFormProps = Readonly<{
  intent: AuthIntent;
  onAuthenticated: () => void;
}>;

const authClient = createAuthClient();

export function AuthForm({ intent, onAuthenticated }: AuthFormProps) {
  const isSignUp = intent === "sign-up";
  const [state, formAction, isPending] = useActionState(
    async (previousState: typeof initialAuthActionState, formData: FormData) => {
      const nextState = await submitAuthForm(authClient, intent, previousState, formData);

      if (nextState.status === "success" && nextState.user) {
        onAuthenticated();
      }

      return nextState;
    },
    initialAuthActionState,
  );
  const form = useForm<AuthInput>({
    resolver: zodResolver(authInputSchema),
    errors: state.fieldErrors,
    defaultValues: {
      intent,
      email: "",
      password: "",
      displayName: "",
    },
  });

  function handleSubmit(values: AuthInput) {
    const formData = new FormData();
    formData.set("intent", intent);
    formData.set("email", values.email);
    formData.set("password", values.password);

    if (values.displayName) {
      formData.set("displayName", values.displayName);
    }

    startTransition(() => formAction(formData));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
        {isSignUp ? (
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manager name</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="name" placeholder="e.g. Marcus Khan" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input {...field} type="email" autoComplete="email" placeholder="you@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <FormLabel>Password</FormLabel>
                {!isSignUp ? (
                  <span className="text-xs text-(--ink-faint)">8+ characters</span>
                ) : null}
              </div>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  placeholder="••••••••"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {state.status === "error" && state.message ? (
          <div
            className="flex items-start gap-2 rounded-xl border border-[rgba(255,131,109,0.25)] bg-[rgba(255,131,109,0.08)] px-3 py-2.75 text-[0.76rem] leading-[1.5] text-[#ffb6a9]"
            role="alert"
          >
            {state.message}
          </div>
        ) : null}
        {state.status === "success" && state.message ? (
          <output className="flex items-start gap-2 rounded-xl border border-[rgba(215,255,79,0.2)] bg-[rgba(215,255,79,0.08)] px-3 py-2.75 text-[0.76rem] leading-[1.5] text-[#d9ef9b]">
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{state.message}</span>
          </output>
        ) : null}

        <SubmitButton intent={intent} pending={isPending} />
      </form>
    </Form>
  );
}

function SubmitButton({ intent, pending }: Readonly<{ intent: AuthIntent; pending: boolean }>) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {getSubmitLabel(intent, pending)}
      {!pending ? <ArrowRight className="h-4 w-4" /> : null}
    </Button>
  );
}

function getSubmitLabel(intent: AuthIntent, pending: boolean) {
  if (pending) {
    if (intent === "sign-up") {
      return "Creating account…";
    }

    return "Signing in…";
  }

  if (intent === "sign-up") {
    return "Create account";
  }

  return "Enter Clubhouse";
}
