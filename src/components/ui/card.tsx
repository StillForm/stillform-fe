import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  selected?: boolean;
}

export function Card({ children, className, interactive, selected }: CardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-[12px] border border-[rgba(38,39,43,0.85)] bg-[rgba(18,18,21,0.82)] p-6 transition-all duration-200",
        interactive &&
          "hover:-translate-y-1 hover:border-[rgba(207,175,109,0.55)] hover:shadow-[0_18px_48px_rgba(207,175,109,0.12)]",
        selected &&
          "border-[rgba(207,175,109,0.75)] shadow-[0_0_24px_rgba(207,175,109,0.25)]",
        className,
      )}
    >
      <div className="relative z-[1]">{children}</div>
      {interactive ? (
        <div className="pointer-events-none absolute inset-0 rounded-[12px] border border-transparent transition-[border-color,transform] duration-200 group-hover:border-[rgba(207,175,109,0.3)]" />
      ) : null}
    </div>
  );
}
