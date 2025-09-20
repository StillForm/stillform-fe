"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => (
    <div className="space-y-2">
      <input
        type={type}
        ref={ref}
        className={cn(
          "h-11 w-full rounded-[12px] border border-[rgba(38,39,43,0.9)] bg-[rgba(12,12,14,0.82)] px-4 text-base text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:border-[rgba(207,175,109,0.65)] focus:shadow-[0_0_0_1px_rgba(207,175,109,0.3)]",
          error && "border-danger focus:border-danger",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  ),
);

Input.displayName = "Input";
