"use client";

import { useEffect, useState, useRef } from "react";
import { Icon } from "@/components/ui";

type ModalProps = {
  triggerText: string;
  triggerIcon?: string;
  triggerClassName?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
};

const MAX_WIDTHS = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
};

export function ActionModal({
  triggerText,
  triggerIcon,
  triggerClassName,
  title,
  description,
  children,
  maxWidth = "xl",
}: ModalProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSubmitCapture = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "FORM" || target.closest("form")) {
      setTimeout(() => {
        setOpen(false);
      }, 150);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-neutral-800 active:scale-95 shadow-sm"
        }
      >
        {triggerIcon && <Icon name={triggerIcon} size={18} />}
        <span>{triggerText}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop */}
          <div
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal / Bottom Sheet Panel */}
          <div
            ref={contentRef}
            onSubmitCapture={handleSubmitCapture}
            className={`relative z-10 w-full ${MAX_WIDTHS[maxWidth]} max-h-[90vh] overflow-y-auto overscroll-contain rounded-t-[32px] sm:rounded-[32px] border-t sm:border border-gray-100 bg-white p-6 sm:p-8 shadow-2xl transition-all`}
          >
            {/* Mobile Sheet Grabber Bar */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200 sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-black sm:text-xl uppercase">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-xs text-gray-400 font-medium leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Tutup"
                className="flex size-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-black hover:text-white transition-colors"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="mt-6">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
