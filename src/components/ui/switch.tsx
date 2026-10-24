import { useId, type ReactNode } from "react";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  hideLabel?: boolean;
};

export function Switch({ checked, onChange, label, description, disabled = false, hideLabel = false }: SwitchProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={`flex min-h-11 items-center justify-between gap-4 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span className={hideLabel ? "sr-only" : "flex flex-col"}>
        <span className="text-sm font-medium text-ink">{label}</span>
        {description && <span className="text-sm text-muted">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="h-7 w-12 rounded-full bg-border-strong transition-colors peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
        <span className="absolute top-1 left-1 size-5 rounded-full bg-cream shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
