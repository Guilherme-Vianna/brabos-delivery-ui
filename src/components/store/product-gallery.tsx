"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export function ProductGallery({ name, urls }: { name: string; urls: string[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);

  if (urls.length === 0) return null;

  function onScroll() {
    const element = track.current;
    if (element) setCurrent(Math.round(element.scrollLeft / element.clientWidth));
  }

  function show(index: number) {
    const element = track.current;
    element?.scrollTo({ left: index * element.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-2">
      <ul
        ref={track}
        onScroll={onScroll}
        aria-label={`Fotos de ${name}`}
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto rounded-2xl bg-surface-raised"
      >
        {urls.map((url, index) => (
          <li key={url} className="relative aspect-[16/9] w-full shrink-0 snap-center">
            <Image
              src={url}
              alt={urls.length > 1 ? `${name}, foto ${index + 1} de ${urls.length}` : name}
              fill
              unoptimized
              sizes="(min-width: 640px) 640px, 100vw"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
      {urls.length > 1 && (
        <div className="flex justify-center gap-1">
          {urls.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => show(index)}
              aria-label={`Ver foto ${index + 1}`}
              aria-current={index === current ? "true" : undefined}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span className={`size-2 rounded-full ${index === current ? "bg-accent" : "bg-border-strong"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
