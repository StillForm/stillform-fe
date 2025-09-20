"use client";

import { createContext, useContext, useMemo } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useCurrentWallet, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import type { Chain } from "@/lib/types";

export type WalletSource = "evm" | "sui" | "solana";

export interface ConnectedWalletSummary {
  address: string;
  label?: string;
  chain: Chain;
  source: WalletSource;
  disconnect?: () => Promise<void> | void;
}

interface WalletContextValue {
  activeWallet?: ConnectedWalletSummary;
  evm: {
    address?: string;
    label?: string;
    disconnect?: () => Promise<void>;
  };
  sui: {
    address?: string;
    label?: string;
    disconnect?: () => Promise<void>;
  };
  solana: {
    address?: string;
    label?: string;
    disconnect?: () => Promise<void>;
  };
}

const WalletContext = createContext<WalletContextValue>({
  evm: {},
  sui: {},
  solana: {},
});

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const evmAccount = useAccount();
  const { disconnectAsync: disconnectEvmAsync } = useDisconnect();

  const currentSuiWallet = useCurrentWallet();
  const currentSuiAccount = useCurrentAccount();
  const disconnectSui = useDisconnectWallet();

  const solana = useSolanaWallet();

  const evmDisconnect = useMemo(() => {
    if (evmAccount.status !== "connected") return undefined;
    return async () => {
      try {
        await disconnectEvmAsync();
      } catch (error) {
        console.error("Failed to disconnect EVM wallet", error);
      }
    };
  }, [disconnectEvmAsync, evmAccount.status]);

  const suiDisconnect = useMemo(() => {
    if (!currentSuiWallet.isConnected) return undefined;
    return async () => {
      try {
        await disconnectSui.mutateAsync();
      } catch (error) {
        console.error("Failed to disconnect Sui wallet", error);
      }
    };
  }, [currentSuiWallet.isConnected, disconnectSui]);

  const solanaDisconnect = useMemo(() => {
    if (!solana.connected) return undefined;
    return async () => {
      try {
        await solana.disconnect();
      } catch (error) {
        console.error("Failed to disconnect Solana wallet", error);
      }
    };
  }, [solana]);

  const evmConnectorName = evmAccount.connector?.name;
  const suiWalletName = currentSuiWallet.isConnected ? currentSuiWallet.currentWallet?.name : undefined;
  const solanaWalletName = solana.wallet?.adapter.name;
  const solanaAddress = solana.publicKey?.toBase58();

  const evmState = useMemo(
    () => ({
      address: evmAccount.address,
      label: evmConnectorName,
      disconnect: evmDisconnect,
    }),
    [evmAccount.address, evmConnectorName, evmDisconnect],
  );

  const suiState = useMemo(
    () => ({
      address: currentSuiAccount?.address,
      label: suiWalletName,
      disconnect: suiDisconnect,
    }),
    [currentSuiAccount?.address, suiWalletName, suiDisconnect],
  );

  const solanaState = useMemo(
    () => ({
      address: solanaAddress,
      label: solanaWalletName,
      disconnect: solanaDisconnect,
    }),
    [solanaAddress, solanaWalletName, solanaDisconnect],
  );

  const activeWallet = useMemo<ConnectedWalletSummary | undefined>(() => {
    if (solana.connected && solanaState.address) {
      return {
        address: solanaState.address,
        label: solanaState.label,
        chain: "Solana",
        source: "solana",
        disconnect: solanaState.disconnect,
      };
    }

    if (currentSuiWallet.isConnected && suiState.address) {
      return {
        address: suiState.address,
        label: suiState.label,
        chain: "Sui",
        source: "sui",
        disconnect: suiState.disconnect,
      };
    }

    if (evmAccount.status === "connected" && evmAccount.address) {
      return {
        address: evmAccount.address,
        label: evmConnectorName,
        chain: "EVM",
        source: "evm",
        disconnect: evmState.disconnect,
      };
    }

    return undefined;
  }, [
    solana.connected,
    solanaState.address,
    solanaState.disconnect,
    solanaState.label,
    currentSuiWallet.isConnected,
    suiState.address,
    suiState.disconnect,
    suiState.label,
    evmAccount.address,
    evmConnectorName,
    evmAccount.status,
    evmState.disconnect,
  ]);

  const value = useMemo(
    () => ({
      activeWallet,
      evm: evmState,
      sui: suiState,
      solana: solanaState,
    }),
    [activeWallet, evmState, solanaState, suiState],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWalletContext() {
  return useContext(WalletContext);
}
