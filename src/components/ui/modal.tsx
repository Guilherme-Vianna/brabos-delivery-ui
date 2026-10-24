"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  locked?: boolean;
  wide?: boolean;
  children: ReactNode;
};

export function Modal({ open, onClose, title, description, locked = false, wide = false, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={(event) => {
        if (locked) event.preventDefault();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !locked) onClose();
      }}
      className={`mx-auto mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl border border-b-0 border-border bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/70 sm:m-auto sm:rounded-3xl sm:border-b ${wide ? "sm:max-w-2xl" : "sm:max-w-md"}`}
    >
      {open && (
        <div className="flex flex-col gap-5 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="font-display text-2xl tracking-wide">
                {title}
              </h2>
              {description && (
                <div id={descriptionId} className="mt-1 text-sm text-muted">
                  {description}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={locked}
              aria-label="Fechar"
              className="-mt-1 -mr-1 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-surface-raised hover:text-ink focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
