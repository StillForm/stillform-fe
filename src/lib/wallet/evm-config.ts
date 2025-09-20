"use client";

import { createConfig, http, injected } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { coinbaseWallet, metaMask } from "@wagmi/connectors";

type BrowserWindow = globalThis.Window;

type InjectedWindow = BrowserWindow & {
  ethereum?: {
    providers?: Array<Record<string, unknown>>;
    isOkxWallet?: boolean;
    isOKExWallet?: boolean;
    isBitgetWallet?: boolean;
    isBitKeep?: boolean;
  } & Record<string, unknown>;
  okxwallet?: { ethereum?: unknown };
  bitget?: { ethereum?: unknown };
  bitkeep?: { ethereum?: unknown };
};

const resolveWindow = (target?: BrowserWindow) => {
  if (target) return target as InjectedWindow;
  if (typeof window === "undefined") return undefined;
  return window as InjectedWindow;
};

const okxProvider = (target?: BrowserWindow) => {
  const injectedWindow = resolveWindow(target);
  if (!injectedWindow) return undefined;
  if (injectedWindow.okxwallet?.ethereum) {
    return injectedWindow.okxwallet.ethereum as unknown;
  }
  const ethereum = injectedWindow.ethereum;
  if (ethereum?.isOkxWallet || ethereum?.isOKExWallet) {
    return ethereum as unknown;
  }
  return undefined;
};

const bitgetProvider = (target?: BrowserWindow) => {
  const injectedWindow = resolveWindow(target);
  if (!injectedWindow) return undefined;
  if (injectedWindow.bitget?.ethereum) {
    return injectedWindow.bitget.ethereum as unknown;
  }
  if (injectedWindow.bitkeep?.ethereum) {
    return injectedWindow.bitkeep.ethereum as unknown;
  }
  const ethereum = injectedWindow.ethereum;
  if (ethereum?.isBitgetWallet || ethereum?.isBitKeep) {
    return ethereum as unknown;
  }
  return undefined;
};

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    metaMask({
      dappMetadata: {
        name: "Stillform",
      },
    }),
    injected({
      target: "rabby",
      shimDisconnect: true,
    }),
    injected({
      shimDisconnect: true,
      target: {
        id: "okxWallet",
        name: "OKX Wallet",
        provider: okxProvider as unknown as never,
      },
    }),
    coinbaseWallet({
      appName: "Stillform",
      preference: {
        options: "all",
      },
    }),
    injected({
      shimDisconnect: true,
      target: {
        id: "bitgetWallet",
        name: "Bitget Wallet",
        provider: bitgetProvider as unknown as never,
      },
    }),
  ],
});

export type WagmiConfig = typeof wagmiConfig;
