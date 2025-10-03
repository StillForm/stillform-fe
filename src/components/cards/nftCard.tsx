"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CollectionDetails } from "@/lib/services";

interface NFTCardProps {
  nft: {
    collection: CollectionDetails;
    tokenId: bigint;
    assetId: string;
  };
  className?: string;
}

export function NFTCard({ nft, className }: NFTCardProps) {
  // 从集合信息中提取NFT数据
  const collection = nft.collection;

  // 从 styles 中获取第一个 baseUri 作为图片
  const imageUrl =
    collection.styles.length > 0
      ? collection.styles[0].baseUri
      : `https://api.dicebear.com/7.x/shapes/svg?seed=${collection.address}`;

  // 格式化价格显示
  const priceInEth = collection.config?.price
    ? `${Number(collection.config.price) / 1e18} ETH`
    : "0 ETH";

  return (
    <Card interactive className={`flex flex-col overflow-hidden ${className}`}>
      <Link
        href={`/asset/${collection.address}/${nft.tokenId}`}
        className="relative block overflow-hidden rounded-[12px]"
      >
        <div className="relative aspect-[4/5] w-full">
          <img
            src={imageUrl}
            alt={`${collection.name}`}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Badge variant="gold">Owned</Badge>
        </div>
      </Link>

      <div className="mt-5 flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-secondary/70">
            <span>EVM</span>
            <span>•</span>
            <span>Token ID: {nft.tokenId.toString()}</span>
          </div>
          <Link
            href={`/asset/${collection.address}/${nft.tokenId}`}
            className="font-display text-xl text-text-primary"
          >
            {collection.name ||
              `Collection ${collection.address.slice(0, 8)}...`}{" "}
            #{nft.tokenId.toString()}
          </Link>
          <p className="text-sm text-text-secondary">
            By {collection.config.creator?.slice(0, 8) || "Unknown"}...
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span className="text-text-secondary">Owned</span>
            <span className="text-text-primary">{priceInEth}</span>
          </div>
          <Button>View Details</Button>
        </div>
      </div>
    </Card>
  );
}
