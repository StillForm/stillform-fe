import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
  optional?: boolean;
}

export function Label({ children, htmlFor, className, optional }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium text-text-secondary", className)}
    >
      {children}
      {optional ? <span className="ml-1 text-xs text-text-secondary/60">(Optional)</span> : null}
    </label>
  );
}
