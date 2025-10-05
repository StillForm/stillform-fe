"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { useModalStore } from "@/lib/stores/modal-store";
import { useAssetStore } from "@/lib/stores/assset-store";
import type { Asset } from "@/lib/types";
import { useAnalytics } from "@/lib/analytics";
import { usePrimaryPurchase } from "@/lib/contracts";

const TAB_ITEMS = [
  { value: "about", label: "About" },
  { value: "attributes", label: "Attributes" },
  { value: "provenance", label: "Provenance" },
  { value: "activity", label: "Activity" },
];

interface ProductDetailViewProps {
  asset: Asset;
  viewerOwns?: boolean;
}

export function ProductDetailView({
  asset,
  viewerOwns,
}: ProductDetailViewProps) {
  const { openModal } = useModalStore();
  const [activeTab, setActiveTab] = useState("about");
  const trackAction = useAnalytics("product_action");
  const pathname = usePathname();
  const assets = useAssetStore((s) => s.assets);
  const [hashId, setHashId] = useState<string | undefined>(undefined);
  const { purchaseEth, isPending, isConfirming, isConfirmed, error } =
    usePrimaryPurchase();

  // Watch the URL hash (e.g., #0xABC...) and keep it in state
  useEffect(() => {
    const readHash = () => {
      if (typeof window === "undefined") return;
      const raw = window.location.hash;
      setHashId(raw ? raw.slice(1) || undefined : undefined);
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  // Derive the assetId from the current URL (hash has priority), e.g. /product/0xABC...#0xABC...
  const assetIdFromPath = useMemo(() => {
    if (!pathname) return undefined;
    const seg = pathname.split("/").filter(Boolean).pop();
    return seg as string | undefined;
  }, [pathname]);

  const resolvedAssetId = hashId ?? assetIdFromPath;

  // Prefer prop asset, otherwise resolve from store by URL id/hash
  const viewAsset: Asset | undefined = useMemo(() => {
    if (asset) return asset;
    if (!resolvedAssetId) return undefined;
    return assets.find(
      (a) => a.id.toLowerCase() === resolvedAssetId.toLowerCase()
    );
  }, [asset, resolvedAssetId, assets]);

  // Render primary action(s) using the resolved asset id
  const renderActions = () => {
    if (!viewAsset) return null;
    if (viewerOwns) {
      return (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              openModal("redemption", { assetId: viewAsset.id });
              trackAction({ type: "request_redemption", id: viewAsset.id });
            }}
          >
            Request Redemption
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              trackAction({ type: "ai_variations", id: viewAsset.id })
            }
          >
            AI Recreate
          </Button>
        </div>
      );
    }
    if (viewAsset.saleType === "auction") {
      return (
        <Button onClick={() => openModal("auction", { assetId: viewAsset.id })}>
          Place Bid
        </Button>
      );
    }
    if (viewAsset.saleType === "blind") {
      return (
        <Button
          onClick={() => openModal("blindBox", { assetId: viewAsset.id })}
        >
          Open Blind Box
        </Button>
      );
    }
    return (
      <Button
        disabled={isPending || isConfirming}
        onClick={async () => {
          try {
            const priceStr = (viewAsset.price || "").toString().trim();
            const priceEth = priceStr.split(/\s+/)[0] || "0";

            trackAction({ type: "buy", id: viewAsset.id });
            await purchaseEth(viewAsset.id as `0x${string}`, priceEth);
          } catch (err) {
            console.error("purchase failed", err);
          }
        }}
      >
        {isPending || isConfirming ? "Processing..." : "Buy Now"}
      </Button>
    );
  };

  // Fallback UI when asset cannot be resolved (e.g., deep link without prior hydration)
  if (!viewAsset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Asset Not Found
          </h1>
          <p className="text-text-secondary mb-2">
            {assetIdFromPath ? (
              <>
                Unable to load asset for{" "}
                <span className="font-mono">{assetIdFromPath}</span>.
              </>
            ) : (
              "Unable to resolve asset from URL."
            )}
          </p>
          <p className="text-text-secondary mb-4">
            Visit the marketplace to hydrate on-chain collections, then try
            again.
          </p>
          <a href="/market" className="text-gold hover:text-gold/80 underline">
            Go to Marketplace
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="border-b border-[rgba(38,39,43,0.75)] bg-[rgba(18,18,21,0.85)]">
        <Container className="grid gap-16 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[20px] border border-[rgba(207,175,109,0.25)]">
              <img
                src={viewAsset.image}
                alt={viewAsset.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="rounded-[16px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-5 text-sm text-text-secondary">
              Physical redemption included for Epic tiers. Shipments originate
              from Kaiwu Vault NYC.
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="gold">{viewAsset.chain}</Badge>
              <h1 className="font-display text-4xl text-text-primary">
                {viewAsset.title}
              </h1>
              <p className="text-lg text-text-secondary">
                {viewAsset.artist.name}
              </p>
              <p className="text-sm text-text-secondary">{viewAsset.edition}</p>
            </div>

            <div className="space-y-4">
              {viewAsset.saleType === "auction" ? (
                <Card className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      Highest Bid
                    </span>
                    <span className="text-2xl text-gold">
                      {viewAsset.highestBid}
                    </span>
                  </div>
                  <div className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                    Ends{" "}
                    {viewAsset.endTime
                      ? new Date(viewAsset.endTime).toLocaleString()
                      : "TBD"}
                  </div>
                </Card>
              ) : (
                <Card className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Price</span>
                    <span className="text-2xl text-text-primary">
                      {viewAsset.price}
                    </span>
                  </div>
                  <div className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                    Physical redemption eligible
                  </div>
                </Card>
              )}
            </div>

            {renderActions()}

            <div className="space-y-3 text-text-secondary">
              <p>{viewAsset.description}</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="space-y-10 pt-14">
        <Tabs items={TAB_ITEMS} value={activeTab} onChange={setActiveTab} />

        {activeTab === "about" ? (
          <Card className="space-y-4">
            <h2 className="font-display text-2xl text-text-primary">
              Artist Statement
            </h2>
            <p className="text-text-secondary">
              This piece bridges Kaiwu&apos;s analog captured crystals with
              on-chain rarity logic. Each collector receives a companion
              archival print on redemption.
            </p>
          </Card>
        ) : null}

        {activeTab === "attributes" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {viewAsset.attributes?.map((attribute) => (
              <Card key={attribute.label} className="space-y-1">
                <p className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                  {attribute.label}
                </p>
                <p className="text-lg text-text-primary">{attribute.value}</p>
              </Card>
            ))}
          </div>
        ) : null}

        {activeTab === "provenance" ? (
          <Card>
            <Table>
              <Thead>
                <Tr>
                  <Th>Transaction</Th>
                  <Th>Date</Th>
                  <Th>Owner</Th>
                </Tr>
              </Thead>
              <Tbody>
                {viewAsset.provenance?.map((entry) => (
                  <Tr key={entry.tx}>
                    <Td className="font-mono text-sm">{entry.tx}</Td>
                    <Td>{new Date(entry.date).toLocaleString()}</Td>
                    <Td>{entry.owner}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Card>
        ) : null}

        {activeTab === "activity" ? (
          <Card>
            <Table>
              <Thead>
                <Tr>
                  <Th>Event</Th>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Value</Th>
                  <Th>Timestamp</Th>
                </Tr>
              </Thead>
              <Tbody>
                {viewAsset.activity?.map((event, index) => (
                  <Tr key={`${event.type}-${index}`}>
                    <Td className="capitalize">{event.type}</Td>
                    <Td>{event.from}</Td>
                    <Td>{event.to ?? "-"}</Td>
                    <Td>{event.value ?? "—"}</Td>
                    <Td>{new Date(event.timestamp).toLocaleString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Card>
        ) : null}
      </Container>
    </div>
  );
}
