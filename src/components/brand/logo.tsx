import { APP_NAME } from "@/lib/brand";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-ink">
      <svg viewBox="0 0 64 64" className={size === "lg" ? "size-10" : "size-8"} aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#D62828" />
        <path d="M14 30a18 13 0 0 1 36 0Z" fill="#FFB703" />
        <rect x="12" y="34" width="40" height="5" rx="2.5" fill="#5C1D0B" />
        <path d="M13 43h38a6 6 0 0 1-6 6H19a6 6 0 0 1-6-6Z" fill="#FFB703" />
      </svg>
      <span className={`font-display tracking-wide ${size === "lg" ? "text-3xl" : "text-2xl"}`}>{APP_NAME}</span>
    </span>
  );
}
