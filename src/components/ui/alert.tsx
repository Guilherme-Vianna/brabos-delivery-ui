import type { ReactNode } from "react";

type Tone = "error" | "info" | "success";

const tones: Record<Tone, string> = {
  error: "border-danger/40 bg-danger-soft text-danger",
  info: "border-border-strong bg-slate text-ink",
  success: "border-success/40 bg-success-soft text-success",
};

export function Alert({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}
    >
      {children}
    </div>
  );
}
