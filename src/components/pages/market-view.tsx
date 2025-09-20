"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Container } from "@/components/layout/container";
import { Chip } from "@/components/ui/chip";
import { AssetCard } from "@/components/cards/asset-card";
import { marketAssets } from "@/data/mock-data";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";

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

  const activeSaleType = searchParams.get("saleType") ?? "all";
  const searchQuery = searchParams.get("q") ?? "";
  const chain = searchParams.get("chain") ?? "All";

  const filteredAssets = useMemo(() => {
    return marketAssets.filter((asset) => {
      const matchesSaleType =
        activeSaleType === "all" ? true : asset.saleType === activeSaleType;
      const matchesChain = chain === "All" ? true : asset.chain === chain;
      const matchesQuery = searchQuery
        ? asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesSaleType && matchesChain && matchesQuery;
    });
  }, [activeSaleType, chain, searchQuery]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "" || value === "all" || value === "All") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/market?${params.toString()}`);
  };

  return (
    <Container className="flex flex-col gap-10 py-16">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-text-secondary/70">Marketplace</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl text-text-primary">Collect across chains</h1>
            <p className="mt-2 max-w-2xl text-text-secondary">
              Filter by sale format, chain, and rarity. Refresh preserves your state via URL.
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
          <Chip key={item} active={chain === item} onClick={() => updateParam("chain", item)}>
            {item}
          </Chip>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {filteredAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
        {filteredAssets.length === 0 ? (
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
