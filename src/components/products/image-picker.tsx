"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ImageIcon } from "@/components/ui/icons";
import { requestImageUploadAction } from "@/lib/products/actions";
import { MAX_UPLOAD_BYTES, resizeImage, uploadWithProgress } from "@/lib/products/image";

type ImagePickerProps = {
  kind: "product" | "logo";
  imageUrl: string | null;
  disabled?: boolean;
  onChange: (value: { key: string | null; url: string | null }) => void;
};

export function ImagePicker({ kind, imageUrl, disabled = false, onChange }: ImagePickerProps) {
  const id = useId();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      const blob = await resizeImage(file).catch(() => file);
      if (blob.size > MAX_UPLOAD_BYTES) throw new Error("A foto passou de 5 MB mesmo depois de reduzida.");
      const contentType = blob.type || "image/webp";
      const upload = await requestImageUploadAction(kind, contentType, blob.size);
      if (!upload.ok) throw new Error(upload.error);
      await uploadWithProgress(upload.data.upload_url, upload.data.method, upload.data.headers, blob, setProgress);
      onChange({ key: upload.data.key, url: URL.createObjectURL(blob) });
    } catch (caught) {
      setError(caught instanceof Error && caught.message.length > 20 ? caught.message : "Não foi possível enviar a foto. Tente de novo.");
    } finally {
      setProgress(null);
    }
  }

  const busy = progress !== null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">
        Foto <span className="font-normal text-muted">(opcional)</span>
      </span>
      <div className="flex items-center gap-4">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border-strong bg-surface-raised text-muted">
          {imageUrl ? (
            <Image src={imageUrl} alt="" fill unoptimized sizes="80px" className="object-cover" />
          ) : (
            <ImageIcon className="size-8" />
          )}
        </div>
        <div className="flex flex-col items-start gap-1">
          <label
            htmlFor={id}
            className={`inline-flex h-11 items-center rounded-full border border-border-strong px-4 text-sm font-medium ${
              disabled || busy ? "cursor-not-allowed text-muted" : "cursor-pointer text-ink hover:border-ink"
            } focus-within:outline-2 focus-within:outline-accent`}
          >
            {busy ? `Enviando… ${Math.round((progress ?? 0) * 100)}%` : imageUrl ? "Trocar foto" : "Escolher foto"}
            <input
              id={id}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={disabled || busy}
              onChange={(event) => {
                void pick(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          {imageUrl && !busy && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange({ key: null, url: null })}
              className="cursor-pointer px-1 text-sm text-danger underline-offset-4 hover:underline"
            >
              Remover foto
            </button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="px-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
