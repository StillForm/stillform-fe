import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn("relative min-h-screen bg-canvas text-text-primary", className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(207,175,109,0.18),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(122,107,255,0.18),transparent_60%)] blur-3xl" />
      </div>
      <div className="relative z-[1] flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}
