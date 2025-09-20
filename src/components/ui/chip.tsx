"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
        active
          ? "border-[rgba(207,175,109,0.55)] bg-[rgba(207,175,109,0.18)] text-gold"
          : "border-[rgba(38,39,43,0.85)] bg-[rgba(12,12,14,0.75)] text-text-secondary hover:border-[rgba(207,175,109,0.35)] hover:text-text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
