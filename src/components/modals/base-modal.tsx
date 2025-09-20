"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
}

export function BaseModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  widthClassName = "max-w-3xl",
}: BaseModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby={description ? "modal-description" : undefined}
            className={cn(
              "relative z-10 mx-auto w-full rounded-[16px] border border-[rgba(207,175,109,0.25)] bg-[rgba(18,18,21,0.95)] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.55)]",
              widthClassName,
            )}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full border border-transparent bg-transparent p-2 text-text-secondary transition hover:border-[rgba(207,175,109,0.35)] hover:text-text-primary"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6 pr-3">
              <div className="space-y-3">
                <h2 id="modal-title" className="font-display text-2xl text-text-primary">
                  {title}
                </h2>
                {description ? (
                  <p id="modal-description" className="max-w-xl text-base text-text-secondary">
                    {description}
                  </p>
                ) : null}
              </div>

              <div className="space-y-6">{children}</div>
            </div>

            {footer ? <div className="mt-8 flex flex-col gap-3 border-t border-divider/60 pt-6">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
