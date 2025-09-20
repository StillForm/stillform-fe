"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, rows = 4, ...props }, ref) => (
    <div className="space-y-2">
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-[12px] border border-[rgba(38,39,43,0.9)] bg-[rgba(12,12,14,0.82)] px-4 py-3 text-base text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:border-[rgba(207,175,109,0.65)]",
          error && "border-danger focus:border-danger",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  ),
);

Textarea.displayName = "Textarea";
