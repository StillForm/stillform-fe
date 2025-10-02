"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Clock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/lib/stores/modal-store";
import type { Asset } from "@/lib/types";
import { logEvent } from "@/lib/analytics";

const saleTypeCopy: Record<Asset["saleType"], string> = {
  fixed: "Buy Now",
  auction: "Place Bid",
  blind: "Open Blind Box",
};

function formatTimeRemaining(endTime?: string) {
  if (!endTime) return null;
  const end = new Date(endTime).getTime();
  const diff = end - Date.now();
  if (diff <= 0) return "Ended";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m left`;
}

export function AssetCard({ asset }: { asset: Asset }) {
  const { openModal } = useModalStore();

  const actionLabel = saleTypeCopy[asset.saleType];
  const timeRemaining = useMemo(
    () => formatTimeRemaining(asset.endTime),
    [asset.endTime]
  );

  const handleAction = () => {
    if (asset.saleType === "auction") {
      openModal("auction", { assetId: asset.id });
      logEvent("auction_bid", { id: asset.id, intent: "open_modal" });
    } else if (asset.saleType === "blind") {
      openModal("blindBox", { assetId: asset.id });
      logEvent("blind_open", { product_id: asset.id, intent: "open_modal" });
    } else {
      logEvent("product_action", { type: "buy", id: asset.id });
      openModal("walletPrompt", { reason: "buy", assetId: asset.id });
    }
  };

  return (
    <Card interactive className="flex flex-col overflow-hidden">
      <Link
        href={`/product/${asset.id}`}
        className="relative block overflow-hidden rounded-[12px]"
      >
        <div className="relative aspect-[4/5] w-full">
          <img
            src={asset.image}
            alt={asset.title}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Badge variant="gold">
            {asset.saleType === "blind"
              ? "Blind"
              : asset.saleType === "auction"
              ? "Auction"
              : "Fixed"}
          </Badge>
          {asset.rarity ? <Badge variant="purple">{asset.rarity}</Badge> : null}
        </div>
      </Link>

      <div className="mt-5 flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-secondary/70">
            <span>{asset.chain}</span>
            <span>•</span>
            <span>{asset.edition}</span>
          </div>
          <Link
            href={`/product/${asset.id}`}
            className="font-display text-xl text-text-primary"
          >
            {asset.title}
          </Link>
          <p className="text-sm text-text-secondary">By {asset.artist.name}</p>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            {asset.saleType === "auction" ? (
              <>
                <span className="flex items-center gap-2 text-gold">
                  <Clock className="h-4 w-4" />
                  {timeRemaining}
                </span>
                <span>
                  Highest Bid{" "}
                  <span className="text-text-primary">{asset.highestBid}</span>
                </span>
              </>
            ) : asset.saleType === "blind" ? (
              <>
                <span className="flex items-center gap-2 text-text-secondary">
                  <Sparkles className="h-4 w-4 text-gold" />
                  Mystery tiers
                </span>
                <span className="text-text-primary">{asset.price}</span>
              </>
            ) : (
              <>
                <span className="text-text-secondary">Price</span>
                <span className="text-text-primary">{asset.price}</span>
              </>
            )}
          </div>
          <Button onClick={handleAction}>{actionLabel}</Button>
        </div>
      </div>
    </Card>
  );
}
