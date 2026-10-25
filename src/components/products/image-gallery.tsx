"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ImageIcon, PlusIcon } from "@/components/ui/icons";
import { MAX_PRODUCT_IMAGES } from "@/lib/api/types";
import type { ProductImage } from "@/lib/products/validation";
import { uploadErrorMessage, uploadImage } from "./upload-image";

type ImageGalleryProps = {
  images: ProductImage[];
  disabled?: boolean;
  onChange: (images: ProductImage[]) => void;
};

export function ImageGallery({ images, disabled = false, onChange }: ImageGalleryProps) {
  const id = useId();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = progress !== null;
  const full = images.length >= MAX_PRODUCT_IMAGES;

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    let next = images;
    try {
      for (const file of Array.from(files).slice(0, MAX_PRODUCT_IMAGES - images.length)) {
        setProgress(0);
        next = [...next, await uploadImage("product", file, setProgress)];
        onChange(next);
      }
    } catch (caught) {
      setError(uploadErrorMessage(caught));
    } finally {
      setProgress(null);
    }
  }

  function remove(index: number) {
    onChange(images.filter((_, position) => position !== index));
  }

  function makeCover(index: number) {
    onChange([images[index], ...images.filter((_, position) => position !== index)]);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">
        Fotos <span className="font-normal text-muted">(opcional, até {MAX_PRODUCT_IMAGES}; a primeira é a capa)</span>
      </span>
      <ul className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <li key={image.key} className="flex w-24 flex-col gap-1">
            <div className="relative size-24 overflow-hidden rounded-2xl border border-border-strong bg-surface-raised">
              <Image src={image.url} alt={`Foto ${index + 1}`} fill unoptimized sizes="96px" className="object-cover" />
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded-full bg-canvas/85 px-2 py-0.5 text-xs font-medium text-ink">Capa</span>
              )}
            </div>
            <div className="flex items-center justify-between px-0.5 text-xs">
              {index > 0 ? (
                <button
                  type="button"
                  disabled={disabled || busy}
                  onClick={() => makeCover(index)}
                  className="cursor-pointer rounded-sm py-1 text-accent underline-offset-4 hover:underline disabled:opacity-50"
                >
                  Capa
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                disabled={disabled || busy}
                aria-label={`Remover foto ${index + 1}`}
                onClick={() => remove(index)}
                className="cursor-pointer rounded-sm py-1 text-danger underline-offset-4 hover:underline disabled:opacity-50"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
        {!full && (
          <li className="w-24">
            <label
              htmlFor={id}
              className={`flex size-24 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border-strong text-center text-xs text-muted ${
                disabled || busy ? "cursor-not-allowed" : "cursor-pointer hover:border-ink hover:text-ink"
              } focus-within:outline-2 focus-within:outline-accent`}
            >
              {busy ? (
                `Enviando… ${Math.round((progress ?? 0) * 100)}%`
              ) : (
                <>
                  {images.length ? <PlusIcon className="size-6" /> : <ImageIcon className="size-6" />}
                  {images.length ? "Mais uma foto" : "Escolher fotos"}
                </>
              )}
              <input
                id={id}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={disabled || busy}
                onChange={(event) => {
                  void add(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          </li>
        )}
      </ul>
      {error && (
        <p role="alert" className="px-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
