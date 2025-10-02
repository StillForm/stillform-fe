"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ProductDetailView } from "@/components/pages/product-detail-view";
import { useAssetStore } from "@/lib/stores/assset-store";
import type { Asset } from "@/lib/types";

interface ProductPageProps {
  params: Promise<{ assetId: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  // Resolve dynamic route param (kept as Promise per existing pattern)
  const [assetId, setAssetId] = useState<string>("");
  useEffect(() => {
    const getParams = async () => {
      const resolved = await params;
      setAssetId(resolved.assetId);
    };
    getParams();
  }, [params]);

  // Subscribe to assets from the store
  const assets = useAssetStore((s) => s.assets);

  // Derive the target asset reactively when assets or assetId change
  const asset: Asset | undefined = useMemo(() => {
    if (!assetId) return undefined;
    return assets.find((a) => a.id === assetId);
  }, [assets, assetId]);

  // Initial loading state while waiting for param resolution
  if (!assetId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Preparing product page...</p>
        </div>
      </div>
    );
  }

  // If asset not yet in store (e.g., user navigated directly), guide them
  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Asset Not Found</h1>
          <p className="text-text-secondary mb-4">
            This item isn’t loaded yet. Visit the marketplace to load blockchain data into your session, then try again.
          </p>
          <Link href="/market" className="text-gold hover:text-gold/80 underline">
            Go to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return <ProductDetailView asset={asset} />;
}
