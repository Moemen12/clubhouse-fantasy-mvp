"use client";

import { Moon, Sun } from "lucide-react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

import { cn } from "./cn";
import { Button } from "./ui";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} {...props}>
      {children}
    </NextThemesProvider>
  );
}

type ThemeToggleProps = Readonly<{
  className?: string;
}>;

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme } = useTheme();

  function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme;
    setTheme(currentTheme === "light" ? "dark" : "light");
  }

  return (
    <Button
      aria-label="Toggle light and dark theme"
      className={cn("border-(--line-strong)", className)}
      onClick={toggleTheme}
      size="icon"
      title="Toggle light and dark theme"
      type="button"
      variant="outline"
    >
      <Sun className="hidden h-4 w-4 [html[data-theme=light]_&]:block" aria-hidden="true" />
      <Moon className="h-4 w-4 [html[data-theme=light]_&]:hidden" aria-hidden="true" />
      <span className="sr-only">Toggle light and dark theme</span>
    </Button>
  );
}
