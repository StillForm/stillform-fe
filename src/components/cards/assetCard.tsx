"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useModalStore } from "@/lib/stores/modal-store";
import type { Asset } from "@/lib/types";
import { logEvent } from "@/lib/analytics";
import { formatTimeRemaining } from "@/lib/utils";

const saleTypeCopy: Record<Asset["saleType"], string> = {
  fixed: "Buy Now",
  auction: "Place Bid",
  blind: "Open Blind Box",
};

interface AssetCardProps {
  asset: Asset;
  className?: string;
}

export function AssetCard({ asset, className }: AssetCardProps) {
  const { openModal } = useModalStore();
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Fallback 图片，基于 asset ID 生成
  const fallbackImageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${asset.id}`;

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

  console.log("AssetCard metadata debug:", {
    asset,
  });

  return (
    <Card interactive className={`flex flex-col overflow-hidden ${className}`}>
      <Link
        href={`/product/${asset.id}`}
        className="relative block overflow-hidden rounded-[12px]"
      >
        <div className="relative aspect-[4/5] w-full">
          {isImageLoading && <Skeleton className="h-full w-full" />}
          <Image
            src={asset.image}
            alt={asset.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            onLoadingComplete={() => setIsImageLoading(false)}
            onError={(e) => {
              // 如果图片加载失败，使用fallback图片
              e.currentTarget.src = fallbackImageUrl;
              setIsImageLoading(false);
            }}
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
          {isImageLoading ? (
            <>
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </>
          ) : (
            <>
              <Link
                href={`/product/${asset.id}`}
                className="font-display text-xl text-text-primary"
              >
                {asset.title}
              </Link>
              <p className="text-sm text-text-secondary">
                By {asset.artist.name}
              </p>
            </>
          )}
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
