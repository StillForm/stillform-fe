"use client";

import { useState } from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import type { Asset } from "@/lib/types";
import { useModalStore } from "@/lib/stores/modal-store";
import { truncateAddress } from "@/lib/utils";

const TAB_ITEMS = [
  { value: "about", label: "About" },
  { value: "attributes", label: "Attributes" },
  { value: "provenance", label: "Provenance" },
  { value: "activity", label: "Activity" },
];

interface AssetDetailViewProps {
  asset: Asset;
  ownerAddress: string;
  viewerOwns?: boolean;
  redeemable?: boolean;
}

export function AssetDetailView({
  asset,
  ownerAddress,
  viewerOwns = true,
  redeemable = true,
}: AssetDetailViewProps) {
  const [activeTab, setActiveTab] = useState("about");
  const { openModal } = useModalStore();

  return (
    <div className="pb-24">
      <Container className="grid gap-16 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[20px] border border-[rgba(207,175,109,0.25)]">
            <Image src={asset.image} alt={asset.title} width={960} height={1200} className="h-full w-full object-cover" />
          </div>
          <Card className="space-y-2 text-sm text-text-secondary">
            <p className="font-semibold text-text-primary">Redemption status</p>
            <p>{redeemable ? "Eligible for physical redemption" : "Already redeemed"}</p>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Badge variant="gold">{asset.chain}</Badge>
            <h1 className="font-display text-4xl text-text-primary">{asset.title}</h1>
            <p className="text-lg text-text-secondary">{asset.artist.name}</p>
            <p className="text-sm text-text-secondary">{asset.edition}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-[14px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">Owner</p>
                <p className="text-text-primary">{truncateAddress(ownerAddress, 6)}</p>
              </div>
              <Button
                variant="tertiary"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(ownerAddress);
                  }
                }}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {viewerOwns && redeemable ? (
              <Button onClick={() => openModal("redemption", { assetId: asset.id })}>
                Request Redemption
              </Button>
            ) : asset.saleType === "blind" ? (
              <Button onClick={() => openModal("blindBox", { assetId: asset.id })}>Open Blind Box</Button>
            ) : asset.saleType === "auction" ? (
              <Button onClick={() => openModal("auction", { assetId: asset.id })}>Join Auction</Button>
            ) : (
              <Button onClick={() => openModal("walletPrompt", { assetId: asset.id })}>Buy Now</Button>
            )}

            <Button variant="secondary" onClick={() => openModal("aiPreset", { source: "asset", assetId: asset.id })}>
              AI Recreate
            </Button>
          </div>

          <p className="text-sm text-text-secondary">{asset.description}</p>
        </div>
      </Container>

      <Container className="space-y-10">
        <Tabs items={TAB_ITEMS} value={activeTab} onChange={setActiveTab} />

        {activeTab === "about" ? (
          <Card className="space-y-4">
            <h2 className="font-display text-2xl text-text-primary">About this asset</h2>
            <p className="text-text-secondary">
              The digital edition is backed by a physical sculpture stored within the Stillform Vault.
              Redeem to schedule shipment with provenance tracking.
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
