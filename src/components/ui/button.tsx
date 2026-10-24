import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "light" | "danger" | "dangerGhost" | "ghost" | "link";

export const buttonVariants: Record<Variant, string> = {
  primary:
    "h-12 rounded-full bg-primary px-6 font-semibold text-on-primary shadow-lg shadow-black/30 hover:bg-primary-hover disabled:bg-primary/50 disabled:text-on-primary/70",
  danger:
    "h-12 rounded-full bg-danger-strong px-6 font-semibold text-on-primary hover:bg-danger-strong/85 disabled:bg-danger-strong/50",
  secondary:
    "h-12 rounded-full border border-border-strong bg-slate px-6 font-medium text-ink hover:bg-slate-hover disabled:text-muted",
  light: "h-12 rounded-full bg-cream px-6 font-semibold text-canvas shadow-lg shadow-black/30 hover:bg-white disabled:opacity-60",
  dangerGhost: "h-12 rounded-full px-5 font-medium text-danger hover:bg-danger-soft disabled:opacity-50",
  ghost: "h-12 rounded-full px-5 font-medium text-ink hover:bg-surface-raised disabled:text-muted",
  link: "rounded-sm font-medium text-accent underline-offset-4 hover:underline disabled:text-muted",
};

export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
  block?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

export function Button({
  variant = "primary",
  loading = false,
  loadingLabel,
  icon,
  block = variant === "primary" || variant === "danger" || variant === "light",
  className = "",
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex cursor-pointer items-center justify-center gap-2.5 text-base transition-colors disabled:cursor-not-allowed ${focusRing} ${buttonVariants[variant]} ${block ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
    </button>
  );
}
