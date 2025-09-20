"use client";

import Image from "next/image";
import { useState } from "react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { useModalStore } from "@/lib/stores/modal-store";
import type { Asset } from "@/lib/types";
import { useAnalytics } from "@/lib/analytics";

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

export function ProductDetailView({ asset, viewerOwns }: ProductDetailViewProps) {
  const { openModal } = useModalStore();
  const [activeTab, setActiveTab] = useState("about");
  const trackAction = useAnalytics("product_action");

  const actionButton = () => {
    if (viewerOwns) {
      return (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              openModal("redemption", { assetId: asset.id });
              trackAction({ type: "request_redemption", id: asset.id });
            }}
          >
            Request Redemption
          </Button>
          <Button variant="secondary" onClick={() => trackAction({ type: "ai_variations", id: asset.id })}>
            AI Recreate
          </Button>
        </div>
      );
    }

    switch (asset.saleType) {
      case "auction":
        return (
          <Button
            onClick={() => {
              openModal("auction", { assetId: asset.id });
            }}
          >
            Place Bid
          </Button>
        );
      case "blind":
        return (
          <Button
            onClick={() => {
              openModal("blindBox", { assetId: asset.id });
            }}
          >
            Open Blind Box
          </Button>
        );
      default:
        return (
          <Button
            onClick={() => {
              openModal("walletPrompt", { assetId: asset.id });
              trackAction({ type: "buy", id: asset.id });
            }}
          >
            Buy Now
          </Button>
        );
    }
  };

  return (
    <div className="pb-24">
      <div className="border-b border-[rgba(38,39,43,0.75)] bg-[rgba(18,18,21,0.85)]">
        <Container className="grid gap-16 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[20px] border border-[rgba(207,175,109,0.25)]">
              <Image src={asset.image} alt={asset.title} width={960} height={1200} className="h-full w-full object-cover" />
            </div>
            <div className="rounded-[16px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-5 text-sm text-text-secondary">
              Physical redemption included for Epic tiers. Shipments originate from Stillform Vault NYC.
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="gold">{asset.chain}</Badge>
              <h1 className="font-display text-4xl text-text-primary">{asset.title}</h1>
              <p className="text-lg text-text-secondary">{asset.artist.name}</p>
              <p className="text-sm text-text-secondary">{asset.edition}</p>
            </div>

            <div className="space-y-4">
              {asset.saleType === "auction" ? (
                <Card className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Highest Bid</span>
                    <span className="text-2xl text-gold">{asset.highestBid}</span>
                  </div>
                  <div className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                    Ends {asset.endTime ? new Date(asset.endTime).toLocaleString() : "TBD"}
                  </div>
                </Card>
              ) : (
                <Card className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Price</span>
                    <span className="text-2xl text-text-primary">{asset.price}</span>
                  </div>
                  <div className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                    Physical redemption eligible
                  </div>
                </Card>
              )}
            </div>

            {actionButton()}

            <div className="space-y-3 text-text-secondary">
              <p>{asset.description}</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="space-y-10 pt-14">
        <Tabs items={TAB_ITEMS} value={activeTab} onChange={setActiveTab} />

        {activeTab === "about" ? (
          <Card className="space-y-4">
            <h2 className="font-display text-2xl text-text-primary">Artist Statement</h2>
            <p className="text-text-secondary">
              This piece bridges Stillform&apos;s analog captured crystals with on-chain rarity logic. Each
              collector receives a companion archival print on redemption.
            </p>
          </Card>
        ) : null}

        {activeTab === "attributes" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {asset.attributes?.map((attribute) => (
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
                {asset.provenance?.map((entry) => (
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
                {asset.activity?.map((event, index) => (
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
