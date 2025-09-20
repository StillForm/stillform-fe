"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <div className="space-y-2">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-[12px] border border-[rgba(38,39,43,0.9)] bg-[rgba(12,12,14,0.82)] px-4 text-base text-text-primary transition-all duration-200 focus:border-[rgba(207,175,109,0.65)]",
          "[background-image:url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M5 7.5L10 12.5L15 7.5\' stroke=\'%23CFAF6D\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E%0A')]",
          "bg-[length:14px_14px] bg-[position:calc(100%-1rem)_center] bg-no-repeat",
          error && "border-danger focus:border-danger",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  ),
);

Select.displayName = "Select";
