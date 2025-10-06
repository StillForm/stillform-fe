"use client";

import { create } from "zustand";
import type { Asset } from "@/lib/types";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
      } catch {
        // Ignore JSON serialization errors
      }
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
  const [metadataCache, setMetadataCache] = useState<
    Record<string, { name?: string; image?: string }>
  >({});

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

  // 获取所有集合的元数据
  useEffect(() => {
    if (!collectionDetails || collectionDetails.length === 0) return;

    const fetchAllMetadata = async () => {
      const newMetadataCache: Record<
        string,
        { name?: string; image?: string }
      > = {};

      await Promise.all(
        collectionDetails.map(async (detail) => {
          const metadataUri = detail.styles?.[0]?.baseUri;
          if (!metadataUri) return;

          try {
            const response = await fetch(metadataUri);
            if (response.ok) {
              const metadata = await response.json();
              newMetadataCache[detail.address] = {
                name: metadata.name,
                image: metadata.image,
              };
            }
          } catch (error) {
            console.error(
              `Failed to fetch metadata for ${detail.address}:`,
              error
            );
          }
        })
      );

      setMetadataCache(newMetadataCache);
    };

    fetchAllMetadata();
  }, [collectionDetails]);

  const handleSetAssetsFromBlockchain = useCallback(
    (detail: CollectionDetails) => {
      const fallbackImageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${detail.address}`;
      const metadataUri = detail.styles?.[0]?.baseUri || "";

      // 从缓存中获取元数据
      const cachedMetadata = metadataCache[detail.address];
      const realImage = cachedMetadata?.image || fallbackImageUrl;
      const realTitle =
        cachedMetadata?.name ||
        detail.name ||
        `Collection ${detail.address.slice(0, 8)}...`;

      // 格式化价格显示
      const priceInEth = detail.config?.price
        ? `${Number(detail.config.price) / 1e18} ETH`
        : "0 ETH";

      return {
        id: detail.address,
        title: realTitle,
        edition: `Supply: ${detail.config?.maxSupply || 0}`,
        chain: "EVM" as const,
        saleType:
          detail.config?.ptype === 1 ? ("blind" as const) : ("fixed" as const),
        price: priceInEth,
        image: realImage,
        metadataUri,
        artist: {
          id: detail.config?.creator || "",
          name: `Creator ${
            detail.config?.creator?.slice(0, 8) || "Unknown"
          }...`,
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
    },
    [metadataCache]
  );

  const processedAssets = useMemo(() => {
    if (activeWallet?.source === "evm" && collectionDetails?.length > 0) {
      return collectionDetails.map(handleSetAssetsFromBlockchain);
    }
    return [];
  }, [activeWallet?.source, collectionDetails, handleSetAssetsFromBlockchain]);

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
