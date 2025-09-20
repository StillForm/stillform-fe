"use client";

import { create } from "zustand";
import { Chain, Network } from "@/lib/types";

interface WalletState {
  panelOpen: boolean;
  activeChain: Chain;
  network: Network;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  setChain: (chain: Chain) => void;
  setNetwork: (network: Network) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  panelOpen: false,
  activeChain: "EVM",
  network: "Mainnet",
  setPanelOpen: (open) => set({ panelOpen: open }),
  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
  setChain: (chain) => set({ activeChain: chain }),
  setNetwork: (network) => set({ network }),
}));
