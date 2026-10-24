"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { CopyIcon, ShareIcon } from "@/components/ui/icons";
import { STORE_PATH } from "@/lib/auth/constants";

const noop = () => () => undefined;

export function StoreLink({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
  const [copied, setCopied] = useState(false);
  const url = `${origin}${STORE_PATH}/${slug}`;

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: "Nosso cardápio", text: "Peça pelo nosso cardápio online:", url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (compact) {
    return (
      <Button variant="secondary" block={false} icon={<ShareIcon />} onClick={share} aria-live="polite">
        <span className="hidden sm:inline">{copied ? "Link copiado!" : "Link do cardápio"}</span>
        <span className="sm:hidden">{copied ? "Copiado!" : "Link"}</span>
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <a href={url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-accent underline underline-offset-4">
        {url || `${STORE_PATH}/${slug}`}
      </a>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          block={false}
          icon={<CopyIcon />}
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }}
        >
          {copied ? "Copiado!" : "Copiar"}
        </Button>
        <Button variant="secondary" block={false} icon={<ShareIcon />} onClick={share}>
          Compartilhar
        </Button>
      </div>
    </div>
  );
}
