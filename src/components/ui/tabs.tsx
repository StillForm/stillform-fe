"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  value: string;
  label: string;
  badge?: ReactNode;
};

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: "underline" | "pill";
}

export function Tabs({ items, value, onChange, className, variant = "underline" }: TabsProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            className={cn(
              "relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-text-secondary transition-all duration-200",
              variant === "underline" &&
                "rounded-none border-b border-transparent pb-2 pt-0 text-base",
              isActive &&
                (variant === "underline"
                  ? "text-text-primary after:absolute after:-bottom-px after:left-0 after:h-[2px] after:w-full after:bg-gold"
                  : "bg-[rgba(207,175,109,0.15)] text-gold border border-[rgba(207,175,109,0.45)]"),
              !isActive &&
                (variant === "underline"
                  ? "hover:text-text-primary"
                  : "hover:border-[rgba(207,175,109,0.3)] hover:text-text-primary"),
            )}
            onClick={() => onChange(item.value)}
          >
            {item.label}
            {item.badge ? (
              <span className="text-xs text-text-secondary/70">{item.badge}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
