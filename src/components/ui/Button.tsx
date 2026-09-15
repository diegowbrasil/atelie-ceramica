import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-clay-500 text-white hover:bg-clay-600 active:bg-clay-700 shadow-soft",
  secondary: "bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-100",
  ghost: "bg-transparent text-ink-600 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800",
  danger: "bg-rose-500 text-white hover:bg-rose-500/90",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(({ className, variant = "primary", size = "md", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-1.5 rounded-xl font-medium",
      "transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-400 focus-visible:ring-offset-2",
      VARIANTS[variant],
      SIZES[size],
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
