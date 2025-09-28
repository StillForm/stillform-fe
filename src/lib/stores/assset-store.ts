"use client";

import { create } from "zustand";
import type { Asset } from "@/lib/types";
import type { ProductionCollection } from "@/lib/services/art-product-collection/useAllProductions";

// 主要是用于存储当前获取到的 assets, 避免又从链上拿一遍
// 后续有后端的话，应该没必要用这个了
interface AssetState {
  // 缓存的资产数据
  assets: Asset[];
  // 原始的区块链数据
  productions: ProductionCollection[];
  // 加载状态
  isLoading: boolean;
  // 错误状态
  error: string | null;

  // Actions
  setAssets: (assets: Asset[]) => void;
  setProductions: (productions: ProductionCollection[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 根据ID获取资产
  getAssetById: (id: string) => Asset | undefined;

  // 清空缓存
  clearCache: () => void;

  // 更新单个资产
  updateAsset: (asset: Asset) => void;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  productions: [],
  isLoading: false,
  error: null,

  setAssets: (assets) => set({ assets }),

  setProductions: (productions) => set({ productions }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  getAssetById: (id) => {
    const { assets } = get();
    return assets.find((asset) => asset.id === id);
  },

  clearCache: () =>
    set({
      assets: [],
      productions: [],
      isLoading: false,
      error: null,
    }),

  updateAsset: (updatedAsset) =>
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset
      ),
    })),
}));
