import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={twMerge(
        "mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
