import { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MainNav } from "@/components/layout/main-nav";
import { WalletPanel } from "@/components/layout/wallet-panel";
import { ModalsRoot } from "@/components/modals/modals-root";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShell>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded-full focus:bg-panel focus:px-6 focus:py-3"
      >
        Skip to content
      </a>
      <MainNav />
      <WalletPanel />
      <div className="flex flex-1 flex-col" id="main-content">
        {children}
      </div>
      <ModalsRoot />
    </AppShell>
  );
}
