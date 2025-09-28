"use client";

import { useEffect, useState } from "react";
import { ProductDetailView } from "@/components/pages/product-detail-view";
import { useAssetStore } from "@/lib/stores/assset-store";
import type { Asset } from "@/lib/types";

interface ProductPageProps {
  params: Promise<{ assetId: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { getAssetById } = useAssetStore();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assetId, setAssetId] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setAssetId(resolvedParams.assetId);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!assetId) return;

    // Try to get from store (cached blockchain data)
    const cachedAsset = getAssetById(assetId);

    if (cachedAsset) {
      setAsset(cachedAsset);
      setIsLoading(false);
    } else {
      // No cached data found
      setAsset(null);
      setIsLoading(false);
    }
  }, [assetId, getAssetById]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Asset Not Found
          </h1>
          <p className="text-text-secondary mb-4">
            This asset might not be loaded yet. Try visiting the marketplace
            first to load blockchain data.
          </p>
          <a href="/market" className="text-gold hover:text-gold/80 underline">
            Go to Marketplace
          </a>
        </div>
      </div>
    );
  }

  return <ProductDetailView asset={asset} />;
}
