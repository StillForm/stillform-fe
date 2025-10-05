"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CollectionDetails } from "@/lib/services";
import { usePhysicalizationStatus } from "@/lib/contracts/physicalization/queryPhysicalization";
import { useRequestPhysicalization } from "@/lib/contracts/physicalization/requestPhysicalization";
import {
  useNFTMetadata,
  useUserTokenIds,
} from "@/lib/contracts/art-product-collection/queryCollection";
import { useModalStore } from "@/lib/stores/modal-store";
import { PhysStatus } from "@/lib/contracts";
import { useAccount } from "wagmi";

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
  const { openModal } = useModalStore();
  const { address } = useAccount();

  // 获取用户在该集合中的真实tokenId
  const { tokenIds } = useUserTokenIds(collection.address, address);

  // 使用真实的tokenId，如果没有则使用传入的tokenId
  const realTokenId = tokenIds.length > 0 ? tokenIds[0] : nft.tokenId;

  // 获取NFT元数据
  const { metadata, isLoading: isMetadataLoading } = useNFTMetadata(
    collection.address,
    realTokenId
  );

  console.log("NFTCard metadata debug:", {
    collectionAddress: collection.address,
    realTokenId: realTokenId.toString(),
    metadata,
    isLoading: isMetadataLoading,
  });

  // 使用元数据中的图片，如果没有则使用fallback
  const imageUrl =
    metadata?.image ||
    `https://api.dicebear.com/7.x/shapes/svg?seed=${collection.address}`;

  // 使用元数据中的名称，如果没有则使用集合名称
  const displayName = metadata?.name || collection.name;

  // 格式化价格显示
  const priceInEth = collection.config?.price
    ? `${Number(collection.config.price) / 1e18} ETH`
    : "0 ETH";

  // 获取实体化状态
  const { status, isLoading: isStatusLoading } = usePhysicalizationStatus(
    collection.address,
    realTokenId
  );

  // 请求实体化
  const { requestPhysicalization, isPending: isRequestPending } =
    useRequestPhysicalization(collection.address);

  // 处理实体化请求
  const handleRequestPhysicalization = async () => {
    try {
      await requestPhysicalization(realTokenId);
    } catch (error) {
      console.error("Failed to request physicalization:", error);
    }
  };

  // 获取状态标签文本
  const getStatusText = () => {
    switch (status) {
      case PhysStatus.NOT_REQUESTED:
        return "Not Requested";
      case PhysStatus.REQUESTED:
        return "Requested";
      case PhysStatus.PROCESSING:
        return "Processing";
      case PhysStatus.COMPLETED:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  // 获取状态标签变体
  const getStatusVariant = () => {
    switch (status) {
      case PhysStatus.NOT_REQUESTED:
        return "secondary" as const;
      case PhysStatus.REQUESTED:
        return "gold" as const;
      case PhysStatus.PROCESSING:
        return "gold" as const;
      case PhysStatus.COMPLETED:
        return "secondary" as const; // 如果没有success变体，使用secondary
      default:
        return "secondary" as const;
    }
  };

  // 检查是否应该显示状态标签
  const shouldShowStatusBadge = () => {
    return status !== PhysStatus.NOT_REQUESTED;
  };

  return (
    <Card interactive className={`flex flex-col overflow-hidden ${className}`}>
      <Link
        href={`/asset/${collection.address}/${realTokenId}`}
        className="relative block overflow-hidden rounded-[12px]"
      >
        <div className="relative aspect-[4/5] w-full">
          <img
            src={imageUrl}
            alt={displayName}
            className="object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => {
              // 如果图片加载失败，使用fallback图片
              e.currentTarget.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${collection.address}`;
            }}
          />
          {isMetadataLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-sm">Loading metadata...</div>
            </div>
          )}
        </div>
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Badge variant="gold">Owned</Badge>
          {shouldShowStatusBadge() && <Badge>{getStatusText()}</Badge>}
        </div>
      </Link>

      <div className="mt-5 flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-secondary/70">
            <span>EVM</span>
            <span>•</span>
            <span>Token ID: {realTokenId.toString()}</span>
          </div>
          <Link
            href={`/asset/${collection.address}/${realTokenId}`}
            className="font-display text-xl text-text-primary"
          >
            {displayName || `Collection ${collection.address.slice(0, 8)}...`} #
            {realTokenId.toString()}
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

          {/* 实体化操作按钮 */}
          <div className="flex gap-2">
            {status === PhysStatus.NOT_REQUESTED ? (
              <Button
                onClick={handleRequestPhysicalization}
                disabled={isRequestPending || isStatusLoading}
                className="flex-1"
              >
                {isRequestPending ? "Requesting..." : "Request Physicalization"}
              </Button>
            ) : (
              <Button
                onClick={() =>
                  openModal("redemption", { assetId: nft.assetId })
                }
                className="flex-1"
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
