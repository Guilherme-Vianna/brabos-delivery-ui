import type { ButtonHTMLAttributes, ReactNode } from "react";

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  selected: boolean;
  children: ReactNode;
};

export function Chip({ selected, className = "", children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? "border-accent bg-accent text-canvas"
          : "border-border-strong bg-surface-raised text-ink hover:border-accent/70"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
