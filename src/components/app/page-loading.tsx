import { Spinner } from "@/components/ui/spinner";

export function PageLoading({ label = "Carregando…" }: { label?: string }) {
  return (
    <p role="status" className="flex items-center gap-3 py-6 text-muted">
      <Spinner className="size-5 text-accent" /> {label}
    </p>
  );
}
