"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Container } from "@/components/layout/container";
import { Chip } from "@/components/ui/chip";
import { AssetCard } from "@/components/cards/asset-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import {
  useAllProductions,
  ProductionCollection,
} from "@/lib/services/art-product-collection/useAllProductions";
import type { Asset } from "@/lib/types";
import { useAssetStore } from "@/lib/stores/assset-store";

const saleTypes = [
  { label: "All", value: "all" },
  { label: "Fixed", value: "fixed" },
  { label: "Auction", value: "auction" },
  { label: "Blind", value: "blind" },
];

const chains = ["All", "EVM", "Solana", "Sui"];

export function MarketView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { productions, isLoading, error } = useAllProductions();
  const { setAssets, setProductions, setLoading, setError } = useAssetStore();

  const activeSaleType = searchParams.get("saleType") ?? "all";
  const searchQuery = searchParams.get("q") ?? "";
  const chain = searchParams.get("chain") ?? "All";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "" || value === "all" || value === "All") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/market?${params.toString()}`);
  };

  console.log("productions", productions);
  // 部分数据占位
  const convertProductionToAsset = (
    production: ProductionCollection
  ): Asset => {
    return {
      id: production.address,
      title: production.name,
      edition: `Collection ${production.address.slice(0, 8)}...`,
      chain: "EVM" as const,
      saleType: "fixed" as const,
      price: "0.1 ETH", // Placeholder
      image: `https://picsum.photos/400/500?random=${production.address}`, // Placeholder image
      artist: {
        id: production.creator,
        name: `Creator ${production.creator.slice(0, 8)}...`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${production.creator}`,
        verified: false,
      },
      rarity: "Common" as const,
      description: `Collection created at block ${production.blockNumber}`,
    };
  };

  const filteredAssets = useMemo(() => {
    // Combine real productions with mock data
    const allAssets = productions.map(convertProductionToAsset);

    // Update store with latest data
    setAssets(allAssets);
    setProductions(productions);
    setLoading(isLoading);
    setError(error);

    return allAssets.filter((asset) => {
      const matchesSaleType =
        activeSaleType === "all" ? true : asset.saleType === activeSaleType;
      const matchesChain = chain === "All" ? true : asset.chain === chain;
      const matchesQuery = searchQuery
        ? asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesSaleType && matchesChain && matchesQuery;
    });
  }, [
    productions,
    activeSaleType,
    chain,
    searchQuery,
    isLoading,
    error,
    setAssets,
    setProductions,
    setLoading,
    setError,
  ]);

  return (
    <Container className="flex flex-col gap-10 py-16">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-text-secondary/70">
          Marketplace
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl text-text-primary">
              Collect across chains
            </h1>
            <p className="mt-2 max-w-2xl text-text-secondary">
              Filter by sale format, chain, and rarity. Refresh preserves your
              state via URL.
            </p>
          </div>
          {searchQuery ? (
            <Badge variant="outline" className="text-sm">
              Showing results for “{searchQuery}”
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {saleTypes.map((item) => (
          <Chip
            key={item.value}
            active={activeSaleType === item.value}
            onClick={() => updateParam("saleType", item.value)}
          >
            {item.label}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {chains.map((item) => (
          <Chip
            key={item}
            active={chain === item}
            onClick={() => updateParam("chain", item)}
          >
            {item}
          </Chip>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">
              Loading collections from blockchain...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-400">
          <p>
            <strong>Error loading blockchain data:</strong> {error}
          </p>
          <p className="mt-1 text-xs">Showing mock data only.</p>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {filteredAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
        {!isLoading && filteredAssets.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              title="No assets found"
              description="Try adjusting sale type, chain, or your search keyword."
              actionLabel="Reset filters"
              onAction={() => router.push("/market")}
            />
          </div>
        ) : null}
      </div>
    </Container>
  );
}
