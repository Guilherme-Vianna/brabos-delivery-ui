import Link from "next/link";
import { Alert } from "@/components/ui/alert";

export function ApiUnavailable({ retryHref }: { retryHref: string }) {
  return (
    <Alert tone="error">
      Não conseguimos carregar seus dados agora. Verifique sua conexão e{" "}
      <Link href={retryHref} className="font-semibold underline underline-offset-4">
        tente de novo
      </Link>
      .
    </Alert>
  );
}
