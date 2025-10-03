"use client";

import { create } from "zustand";
import type { Asset } from "@/lib/types";
import { useEffect, useMemo, useRef } from "react";
import { useWalletContext } from "@/lib/wallet/wallet-context";
import { useRecentCollections } from "@/lib/contracts/common/events";
import {
  CollectionDetails,
  useMultipleCollectionDetails,
} from "@/lib/services";

interface AssetState {
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  getAssetById: (id: string) => Asset | undefined;
  clearCache: () => void;
  updateAsset: (asset: Asset) => void;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],

  setAssets: (assets) =>
    set((state) => {
      try {
        const prevHash = JSON.stringify(state.assets);
        const nextHash = JSON.stringify(assets);
        if (prevHash === nextHash) return state;
      } catch (_) {}
      return { assets };
    }),

  getAssetById: (id) => {
    const { assets } = get();
    return assets.find((asset) => asset.id === id);
  },

  clearCache: () => set({ assets: [] }),

  updateAsset: (updatedAsset) =>
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset
      ),
    })),
}));

export const AssetStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const assetsHashRef = useRef<string>("");
  const { activeWallet } = useWalletContext();
  // Select only the action to avoid re-rendering this provider when assets state changes
  const setAssets = useAssetStore((s) => s.setAssets);

  // 获取最近的集合
  const { collections } = useRecentCollections(1000);
  const collectionAddresses = useMemo<`0x${string}`[]>(() => {
    if (activeWallet?.source === "evm" && collections?.length > 0) {
      return collections.map((c) => c.collection as `0x${string}`);
    }
    return [] as `0x${string}`[];
  }, [activeWallet?.source, collections]);

  const { collectionDetails } =
    useMultipleCollectionDetails(collectionAddresses);

  const handleSetAssetsFromBlockchain = (detail: CollectionDetails) => {
    console.log("block detail", detail);
    // 从 styles 中获取第一个 baseUri 作为图片
    const imageUrl =
      detail.styles.length > 0
        ? detail.styles[0].baseUri
        : `https://api.dicebear.com/7.x/shapes/svg?seed=${detail.address}`;

    // 格式化价格显示
    const priceInEth = detail.config?.price
      ? `${Number(detail.config.price) / 1e18} ETH`
      : "0 ETH";

    return {
      id: detail.address,
      title: detail.name || `Collection ${detail.address.slice(0, 8)}...`,
      edition: `Supply: ${detail.config?.maxSupply || 0}`,
      chain: "EVM" as const,
      saleType:
        detail.config?.ptype === 1 ? ("blind" as const) : ("fixed" as const),
      price: priceInEth,
      image: imageUrl,
      artist: {
        id: detail.config?.creator || "",
        name: `Creator ${detail.config?.creator?.slice(0, 8) || "Unknown"}...`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${
          detail.config?.creator || "default"
        }`,
        verified: false,
      },
      rarity: "Common" as const,
      description: `Collection with ${Number(
        detail.totalSupply || 0
      )} items minted`,
    };
  };

  const processedAssets = useMemo(() => {
    if (activeWallet?.source === "evm" && collectionDetails?.length > 0) {
      return collectionDetails.map(handleSetAssetsFromBlockchain);
    }
    return [];
  }, [activeWallet?.source, collectionDetails]);

  useEffect(() => {
    console.log("collectionDetails=", processedAssets);
    if (processedAssets.length > 0) {
      const nextHash = JSON.stringify(processedAssets);
      if (nextHash !== assetsHashRef.current) {
        setAssets(processedAssets);
        assetsHashRef.current = nextHash;
      }
    }
  }, [processedAssets]);

  return <>{children}</>;
};
