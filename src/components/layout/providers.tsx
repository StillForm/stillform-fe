"use client";

import { ReactNode, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BitgetWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useStandardWalletAdapters } from "@solana/wallet-standard-wallet-adapter-react";
import { Toaster } from "sonner";
import {
  SuiClientProvider,
  WalletProvider as SuiWalletProvider,
} from "@mysten/dapp-kit";
import "@mysten/dapp-kit/dist/index.css";
import { wagmiConfig } from "@/lib/wallet/evm-config";
import { suiNetworkConfig } from "@/lib/wallet/sui-config";
import { WalletContextProvider } from "@/lib/wallet/wallet-context";

type ProvidersProps = {
  children: ReactNode;
};

const SOLANA_ENDPOINT = clusterApiUrl("mainnet-beta");

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={suiNetworkConfig} defaultNetwork="mainnet">
          <SuiWalletProvider autoConnect>
            <SolanaProviders>
              <WalletContextProvider>
                {children}
                <Toaster
                  position="top-right"
                  duration={3200}
                  toastOptions={{
                    style: {
                      background: "rgba(26, 20, 36, 0.88)",
                      border: "1px solid rgba(207, 175, 109, 0.35)",
                      color: "#F5F7FA",
                      backdropFilter: "blur(14px)",
                    },
                  }}
                />
              </WalletContextProvider>
            </SolanaProviders>
          </SuiWalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function SolanaProviders({ children }: { children: ReactNode }) {
  const baseAdapters = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BitgetWalletAdapter(),
    ],
    []
  );

  const wallets = useStandardWalletAdapters(baseAdapters);

  return (
    <ConnectionProvider endpoint={SOLANA_ENDPOINT}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        {children}
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
