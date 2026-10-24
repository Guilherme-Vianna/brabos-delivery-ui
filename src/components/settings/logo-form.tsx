"use client";

import { useState, useTransition } from "react";
import { ImagePicker } from "@/components/products/image-picker";
import { updateSettingsAction } from "@/lib/establishment/actions";

export function LogoForm({ logoUrl }: { logoUrl: string | null }) {
  const [url, setUrl] = useState(logoUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      <ImagePicker
        kind="logo"
        imageUrl={url}
        disabled={pending}
        onChange={({ key, url: next }) => {
          const previous = url;
          setUrl(next);
          setError(null);
          startTransition(async () => {
            const result = await updateSettingsAction({ logo_key: key });
            if (!result.ok) {
              setUrl(previous);
              setError(result.error);
            }
          });
        }}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
