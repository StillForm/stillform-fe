import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "gold" | "outline" | "purple" | "neutral";

const styles: Record<BadgeVariant, string> = {
  gold: "bg-[rgba(207,175,109,0.18)] text-gold border border-[rgba(207,175,109,0.4)]",
  outline: "bg-transparent text-text-secondary border border-divider",
  purple: "bg-[rgba(122,107,255,0.2)] text-text-primary border border-[rgba(122,107,255,0.4)]",
  neutral: "bg-panel text-text-secondary border border-[rgba(38,39,43,0.9)]",
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "gold", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-widest",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
