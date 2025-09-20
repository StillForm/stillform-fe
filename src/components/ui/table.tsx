import { TableHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-hidden rounded-[12px] border border-[rgba(38,39,43,0.9)]">
      <table
        className={cn(
          "w-full border-collapse bg-[rgba(18,18,21,0.88)] text-left text-sm text-text-secondary",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function Thead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("text-xs uppercase tracking-[0.18em] text-text-secondary/70", className)}
      {...props}
    />
  );
}

export function Tbody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-[rgba(38,39,43,0.7)]", className)} {...props} />;
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "transition-colors duration-200 hover:bg-[rgba(31,25,43,0.45)]",
        className,
      )}
      {...props}
    />
  );
}

export function Th({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-6 py-4 font-normal text-text-secondary", className)} {...props} />
  );
}

export function Td({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-6 py-5 text-sm text-text-primary", className)} {...props} />
  );
}
