"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, LogOut, WalletMinimal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import {
  useWallets as useSuiWallets,
  useConnectWallet,
  useDisconnectWallet,
  useCurrentWallet,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { cn, truncateAddress } from "@/lib/utils";
import { logEvent } from "@/lib/analytics";
import type { Chain } from "@/lib/types";
import { toast } from "sonner";
import { useWalletContext } from "@/lib/wallet/wallet-context";

const CHAINS: Chain[] = ["EVM", "Solana", "Sui"];
const EVM_CONNECTOR_ORDER = ["metaMaskSDK", "rabby", "okxWallet", "coinbaseWalletSDK", "bitgetWallet"] as const;
const SUI_WALLETS = new Set(["Suiet", "Ethos", "Sui Wallet", "OKX Wallet", "Bitget Wallet"]);
const SOLANA_WALLETS = new Set(["Phantom", "Solflare", "Backpack", "OKX Wallet", "Bitget Wallet"]);

type InjectedWindow = Window & {
  ethereum?: {
    providers?: Array<Record<string, unknown>>;
    isMetaMask?: boolean;
    isRabby?: boolean;
    isOkxWallet?: boolean;
    isOKExWallet?: boolean;
    isBitgetWallet?: boolean;
    isBitKeep?: boolean;
    isCoinbaseWallet?: boolean;
  } & Record<string, unknown>;
  coinbaseWalletExtension?: unknown;
  okxwallet?: { ethereum?: unknown };
  bitkeep?: { ethereum?: unknown };
  bitget?: { ethereum?: unknown };
};

const hasProviderFlag = (flag: string) => {
  if (typeof window === "undefined") return false;
  const injected = window as InjectedWindow;
  const provider = injected.ethereum;
  if (provider?.[flag as keyof typeof provider]) return true;
  const candidates = (provider?.providers ?? []) as Array<Record<string, unknown>>;
  return candidates.some((candidate) => Boolean(candidate?.[flag]));
};

const detectEvmConnector = (connectorId: string) => {
  if (typeof window === "undefined") return false;
  const injected = window as InjectedWindow;

  switch (connectorId) {
    case "metaMask":
    case "metaMaskSDK":
      return hasProviderFlag("isMetaMask");
    case "rabby":
      return hasProviderFlag("isRabby");
    case "okxWallet":
      return Boolean(injected.okxwallet?.ethereum) || hasProviderFlag("isOkxWallet") || hasProviderFlag("isOKExWallet");
    case "coinbaseWalletSDK":
      return Boolean(injected.coinbaseWalletExtension) || hasProviderFlag("isCoinbaseWallet");
    case "bitgetWallet":
      return (
        Boolean(injected.bitget?.ethereum) ||
        Boolean(injected.bitkeep?.ethereum) ||
        hasProviderFlag("isBitgetWallet") ||
        hasProviderFlag("isBitKeep")
      );
    default:
      return Boolean((injected.ethereum as Record<string, unknown> | undefined)?.providers ?? injected.ethereum);
  }
};

interface PanelWalletEntry {
  id: string;
  chain: Chain;
  label: string;
  address?: string;
  ready: boolean;
  isActive: boolean;
  onConnect: () => Promise<unknown>;
  onDisconnect?: () => Promise<unknown>;
}

export function WalletPanel() {
  const ref = useRef<HTMLDivElement | null>(null);
  const {
    panelOpen,
    setPanelOpen,
    activeChain,
    setChain,
    network,
    setNetwork,
  } = useWalletStore();

  const { evm: evmState, sui: suiState, solana: solanaState } = useWalletContext();

  const { connectors, connectAsync } = useConnect();
  const { disconnectAsync: disconnectEvmAsync } = useDisconnect();
  const evmAccount = useAccount();

  const suiWallets = useSuiWallets();
  const { mutateAsync: connectSuiAsync } = useConnectWallet();
  const { mutateAsync: disconnectSuiAsync } = useDisconnectWallet();
  const currentSuiWallet = useCurrentWallet();
  const currentSuiAccount = useCurrentAccount();

  const solana = useSolanaWallet();

  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    }

    if (panelOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [panelOpen, setPanelOpen]);

  const evmConnectorId = evmAccount.connector?.id;
  const evmEntries = useMemo(() => {
    const orderMap = new Map<string, number>(EVM_CONNECTOR_ORDER.map((id, index) => [id, index]));
    return connectors
      .filter((connector) => orderMap.has(connector.id))
      .map((connector) => {
        const isActive = evmConnectorId === connector.id && evmAccount.status === "connected";
        const labelOverrides: Record<string, string> = {
          okxWallet: "OKX Wallet",
          bitgetWallet: "Bitget Wallet",
          rabby: "Rabby",
          metaMaskSDK: "MetaMask",
          coinbaseWalletSDK: "Coinbase Wallet",
        };
        const isAvailable = Boolean(connector.ready) || detectEvmConnector(connector.id);
        return {
          entry: {
            id: `evm-${connector.id}`,
            chain: "EVM" as Chain,
            label: labelOverrides[connector.id] ?? connector.name,
            address: isActive ? evmAccount.address : undefined,
            ready: isAvailable,
            isActive,
            onConnect: () => connectAsync({ connector }),
            onDisconnect: isActive ? () => disconnectEvmAsync() : undefined,
          },
          order: orderMap.get(connector.id) ?? 99,
        } satisfies { entry: PanelWalletEntry; order: number };
      })
      .sort((a, b) => a.order - b.order)
      .map((item) => item.entry);
  }, [connectAsync, connectors, disconnectEvmAsync, evmAccount.address, evmAccount.status, evmConnectorId]);

  const suiEntries = useMemo(() => {
    return suiWallets
      .filter((wallet) => SUI_WALLETS.has(wallet.name))
      .map<PanelWalletEntry>((wallet) => {
        const isActive = currentSuiWallet.isConnected && currentSuiWallet.currentWallet?.name === wallet.name;
        return {
          id: `sui-${wallet.name.toLowerCase().replace(/\s+/g, "-")}`,
          chain: "Sui",
          label: wallet.name,
          address: isActive ? currentSuiAccount?.address : undefined,
          ready: true,
          isActive,
          onConnect: () => connectSuiAsync({ wallet }),
          onDisconnect: isActive ? () => disconnectSuiAsync() : undefined,
        };
      });
  }, [connectSuiAsync, currentSuiAccount?.address, currentSuiWallet, disconnectSuiAsync, suiWallets]);

  const solanaEntries = useMemo(() => {
    return solana.wallets
      .filter((wallet) => SOLANA_WALLETS.has(wallet.adapter.name))
      .map<PanelWalletEntry>((wallet) => {
        const name = wallet.adapter.name;
        const ready =
          wallet.readyState === WalletReadyState.Installed || wallet.readyState === WalletReadyState.Loadable;
        const isActive = solana.wallet?.adapter.name === name && solana.connected;
        return {
          id: `sol-${name.toLowerCase().replace(/\s+/g, "-")}`,
          chain: "Solana",
          label: name,
          address: isActive && solana.publicKey ? solana.publicKey.toBase58() : undefined,
          ready,
          isActive,
          onConnect: async () => {
            if (solana.wallet?.adapter.name !== name) {
              solana.select(wallet.adapter.name);
            }
            if (!solana.connected || solana.wallet?.adapter.name !== name) {
              await solana.connect();
            }
          },
          onDisconnect: isActive ? () => solana.disconnect() : undefined,
        };
      });
  }, [solana]);

  const walletEntries = useMemo(() => {
    switch (activeChain) {
      case "EVM":
        return evmEntries;
      case "Sui":
        return suiEntries;
      case "Solana":
        return solanaEntries;
      default:
        return [];
    }
  }, [activeChain, evmEntries, solanaEntries, suiEntries]);

  const chainStateMap: Record<Chain, { address?: string; label?: string }> = {
    EVM: evmState,
    Sui: suiState,
    Solana: solanaState,
  };

  const chainState = chainStateMap[activeChain] ?? {};
  const headerAddress = chainState.address;
  const headerLabel = chainState.label;

  const isPending = (id: string) => pendingId === id;

  const handleConnect = async (entry: PanelWalletEntry) => {
    if (entry.isActive) return;
    try {
      setPendingId(entry.id);
      await entry.onConnect();
      toast.success(`${entry.label} connected`);
      logEvent("wallet_connect", { walletId: entry.id, chain: entry.chain });
      setPanelOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect";
      const normalized = message.toLowerCase();
      if (normalized.includes("provider not found") || normalized.includes("connector")) {
        toast.error(`${entry.label} extension not detected. Install or enable it, then try again.`);
      } else {
        toast.error(message);
      }
      console.error("Wallet connect error", error);
    } finally {
      setPendingId(null);
    }
  };

  const handleDisconnect = async (entry: PanelWalletEntry) => {
    if (!entry.onDisconnect) return;
    try {
      setPendingId(entry.id);
      await entry.onDisconnect();
      toast.info(`${entry.label} disconnected`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to disconnect";
      toast.error(message);
      console.error("Wallet disconnect error", error);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <AnimatePresence>
      {panelOpen ? (
        <motion.div
          ref={ref}
          className="fixed right-8 top-24 z-50 w-[420px] rounded-[16px] border border-[rgba(207,175,109,0.3)] bg-[rgba(18,18,21,0.95)] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.55)]"
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary/70">
                {headerAddress ? "Connected as" : "Connect a wallet"}
              </p>
              <h3 className="mt-2 font-display text-2xl text-text-primary">
                {headerAddress ? truncateAddress(headerAddress, 6) : "Select wallet"}
              </h3>
              {headerLabel ? (
                <p className="mt-1 text-sm text-text-secondary">{headerLabel}</p>
              ) : null}
            </div>
            <Badge variant="outline" className="border-[rgba(207,175,109,0.4)] text-xs uppercase tracking-[0.25em]">
              Network: {network}
            </Badge>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-[12px] border border-[rgba(38,39,43,0.85)] bg-[rgba(12,12,14,0.78)] p-2">
            {(["Mainnet", "Testnet"] as const).map((value) => {
              const isActive = network === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setNetwork(value);
                  }}
                  className={cn(
                    "flex-1 rounded-[10px] px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[rgba(207,175,109,0.16)] text-gold"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <Tabs
              items={CHAINS.map((chain) => ({ value: chain, label: chain }))}
              value={activeChain}
              onChange={(value) => setChain(value as Chain)}
              variant="pill"
            />
          </div>

          <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
            {walletEntries.length === 0 ? (
              <p className="rounded-[12px] border border-[rgba(38,39,43,0.65)] bg-[rgba(10,10,12,0.55)] p-4 text-sm text-text-secondary">
                No compatible wallets detected for this chain. Install one of the recommended extensions and refresh.
              </p>
            ) : (
              walletEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[12px] border border-[rgba(38,39,43,0.85)] bg-[rgba(10,10,12,0.65)] p-4 transition",
                    entry.isActive &&
                      "border-[rgba(207,175,109,0.6)] bg-[rgba(207,175,109,0.12)]",
                  )}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(207,175,109,0.12)] text-gold">
                    <WalletMinimal className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-text-primary">{entry.label}</p>
                    <p className="text-xs text-text-secondary">
                      {entry.address ? truncateAddress(entry.address) : "Not connected"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant={entry.isActive ? "tertiary" : entry.ready ? "primary" : "secondary"}
                      disabled={isPending(entry.id)}
                      loading={!entry.isActive && isPending(entry.id)}
                      onClick={() => handleConnect(entry)}
                    >
                      {entry.isActive ? "Connected" : "Connect"}
                    </Button>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-transparent p-2 text-text-secondary transition hover:border-[rgba(207,175,109,0.35)] hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-55"
                        onClick={() => {
                          if (!entry.address) return;
                          navigator.clipboard
                            .writeText(entry.address)
                            .then(() => toast.success("Address copied"))
                            .catch(() => toast.error("Clipboard unavailable"));
                        }}
                        disabled={!entry.address}
                        aria-label="Copy address"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {entry.isActive && entry.onDisconnect ? (
                        <button
                          type="button"
                          className="rounded-full border border-transparent p-2 text-text-secondary transition hover:border-[rgba(207,175,109,0.35)] hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-55"
                          onClick={() => handleDisconnect(entry)}
                          disabled={isPending(entry.id)}
                          aria-label="Disconnect wallet"
                        >
                          <LogOut className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
