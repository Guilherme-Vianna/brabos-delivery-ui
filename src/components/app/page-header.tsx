import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, eyebrow, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="truncate text-sm font-medium text-accent">{eyebrow}</p>}
        <h1 className="mt-0.5 font-display text-4xl tracking-wide text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
