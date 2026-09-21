import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover shadow-soft",
  secondary: "bg-cream-soft text-ink hover:bg-line",
  ghost: "bg-transparent text-ink-soft hover:bg-cream-soft",
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
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
      VARIANTS[variant],
      SIZES[size],
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
