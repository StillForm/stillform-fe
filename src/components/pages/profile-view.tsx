"use client";

import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { AssetCard } from "@/components/cards/assetCard";
import { NFTCard } from "@/components/cards/nftCard";
import { profileSummary, profileActivity } from "@/data/mock-data";
import { truncateAddress } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/lib/analytics";
import { useAssetStore } from "@/lib/stores/assset-store";
import React, { useMemo, useState } from "react";
import { useUserAssets } from "@/lib/services";
import {
  Twitter,
  MessageCircle,
  Instagram,
  Clock,
  Truck,
  CheckCircle,
  Package,
} from "lucide-react";
import { useOrderManager, PhysStatus } from "@/lib/contracts";
import { useUserCollectionAddresses } from "@/lib/contracts/art-product-collection/queryCollection";
import { usePhysicalizationStatus } from "@/lib/contracts/physicalization/queryPhysicalization";
import { Card } from "@/components/ui/card";
import { useModalStore } from "@/lib/stores/modal-store";
import type { Address } from "viem";

interface ProfileView {
  address: `0x${string}`;
}

export function ProfileView({ address }: ProfileView) {
  const { assets } = useAssetStore();
  const trackAssetClick = useAnalytics("profile_asset_click");
  const { openModal } = useModalStore();
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  );

  // 社交媒体图标配置
  const socialLinks = [
    { icon: Twitter, label: "X (formerly Twitter)", href: "#" },
    { icon: MessageCircle, label: "Discord", href: "#" },
    { icon: Instagram, label: "Instagram", href: "#" },
  ];

  const createdAssets = useMemo(() => {
    return assets.filter((asset) => asset.artist.id === address);
  }, [assets, address]);

  // 获取用户拥有的NFT资产
  const { userNFTAssets, isLoading, error } = useUserAssets(
    address,
    assets.map((asset) => asset.id as `0x${string}`)
  );

  // 暂时使用原始的userNFTAssets，真实的tokenId获取需要在NFTCard组件内部处理
  const realUserNFTAssets = userNFTAssets;

  // 获取用户的所有集合地址（作为创作者）
  const { collectionAddresses } = useUserCollectionAddresses(address);

  // 工单管理
  const { markProcessing, completeOrder, isPending, isConfirming } =
    useOrderManager();

  console.log("ownedAddress", realUserNFTAssets);

  // 从userNFTAssets中筛选出有实体化申请的NFT作为订单
  // 这个在下面的OrderCard组件中处理

  // 获取状态文本
  const getStatusText = (status: PhysStatus) => {
    switch (status) {
      case PhysStatus.REQUESTED:
        return "Pending";
      case PhysStatus.PROCESSING:
        return "Processing";
      case PhysStatus.COMPLETED:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: PhysStatus) => {
    switch (status) {
      case PhysStatus.REQUESTED:
        return <Clock className="h-5 w-5" />;
      case PhysStatus.PROCESSING:
        return <Truck className="h-5 w-5" />;
      case PhysStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: PhysStatus) => {
    switch (status) {
      case PhysStatus.REQUESTED:
        return "bg-yellow-500/20 text-yellow-500";
      case PhysStatus.PROCESSING:
        return "bg-blue-500/20 text-blue-500";
      case PhysStatus.COMPLETED:
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  // 处理标记为配送中
  const handleMarkProcessing = async (orderInfo: {
    collectionAddress: Address;
    tokenId: bigint;
  }) => {
    const orderId = `${orderInfo.collectionAddress}-${orderInfo.tokenId}`;
    setProcessingOrderId(orderId);
    try {
      await markProcessing(orderInfo.collectionAddress, orderInfo.tokenId);
    } catch (error) {
      console.error("Failed to mark processing:", error);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // 处理标记为已完成
  const handleCompleteOrder = async (orderInfo: {
    collectionAddress: Address;
    tokenId: bigint;
  }) => {
    const orderId = `${orderInfo.collectionAddress}-${orderInfo.tokenId}`;
    setProcessingOrderId(orderId);
    try {
      await completeOrder(orderInfo.collectionAddress, orderInfo.tokenId);
    } catch (error) {
      console.error("Failed to complete order:", error);
    } finally {
      setProcessingOrderId(null);
    }
  };

  // 简单的OrderCard组件 - 接收NFT信息，内部查询实体化状态
  const OrderCard = React.memo(function OrderCard({
    collectionAddress,
    tokenId,
    isCreator,
  }: {
    collectionAddress: Address;
    tokenId: bigint;
    isCreator: boolean;
  }) {
    const { status, isLoading } = usePhysicalizationStatus(
      collectionAddress,
      tokenId
    );

    // 加载中或没有申请实体化，不显示
    if (isLoading || status === PhysStatus.NOT_REQUESTED) return null;

    const orderId = `${collectionAddress}-${tokenId}`;
    const isProcessingThis =
      processingOrderId === orderId || isPending || isConfirming;
    const isSelf = true; // 在个人页面，都是自己的

    return (
      <Card key={orderId} className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Status Icon */}
            <div className={`p-3 rounded-full ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
            </div>

            {/* Order Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-lg text-text-primary">
                  Token #{tokenId.toString()}
                </h3>
                <Badge className={getStatusColor(status)}>
                  {getStatusText(status)}
                </Badge>
                {isSelf && isCreator && (
                  <Badge className="text-xs bg-gray-500/20 text-gray-400">
                    Self Order
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-sm text-text-secondary">
                <p>
                  Collection:{" "}
                  <span className="font-mono">
                    {truncateAddress(collectionAddress, 6)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {isCreator ? (
              <>
                {status === PhysStatus.REQUESTED && (
                  <Button
                    onClick={() =>
                      handleMarkProcessing({ collectionAddress, tokenId })
                    }
                    disabled={isProcessingThis}
                    size="sm"
                  >
                    {isProcessingThis ? "Processing..." : "Mark as Processing"}
                  </Button>
                )}
                {status === PhysStatus.PROCESSING && (
                  <Button
                    onClick={() =>
                      handleCompleteOrder({ collectionAddress, tokenId })
                    }
                    disabled={isProcessingThis}
                    size="sm"
                  >
                    {isProcessingThis ? "Completing..." : "Mark as Completed"}
                  </Button>
                )}
                {status === PhysStatus.COMPLETED && (
                  <Badge variant="gold">Delivered</Badge>
                )}
              </>
            ) : (
              <Button
                onClick={() =>
                  openModal("orderStatus", {
                    collectionAddress,
                    tokenId,
                    owner: address,
                    status,
                  })
                }
                size="sm"
                variant="secondary"
              >
                View Status
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  });

  return (
    <div className="pb-20">
      <div className="relative h-72 w-full overflow-hidden">
        <Image
          src={profileSummary.coverImage}
          alt={profileSummary.handle}
          fill
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,11,0.95)] via-transparent to-transparent" />
      </div>

      <Container className="relative -mt-20 flex flex-col gap-12">
        <div className="flex flex-col gap-10 rounded-[20px] border border-[rgba(207,175,109,0.3)] bg-[rgba(12,12,14,0.9)] p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-6">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-[3px] border-[rgba(207,175,109,0.6)]">
              <Image
                src={profileSummary.avatar}
                alt={profileSummary.handle}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl text-text-primary">
                  {truncateAddress(profileSummary.address, 6)}
                </h1>
                <Badge variant="gold">Creator</Badge>
              </div>
              <p className="text-sm text-text-secondary">
                {profileSummary.bio}
              </p>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="rounded-full bg-text-secondary/10 p-2 text-text-secondary hover:bg-gold/20 hover:text-gold transition-all duration-200"
                      aria-label={social.label}
                    >
                      <IconComponent className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Follow</Button>
            <Button variant="tertiary">Share Profile</Button>
          </div>
        </div>

        {/* Created Assets */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-text-primary">
              Created works
            </h2>
            <Button variant="tertiary">View all</Button>
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {createdAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => trackAssetClick({ asset_id: asset.id })}
              >
                <AssetCard asset={asset} />
              </div>
            ))}
          </div>
        </section>

        {/* Collections */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-text-primary">
              Owned Collections
            </h2>
            <Button variant="tertiary">View all</Button>
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              <p>Loading owned collections...</p>
            ) : error ? (
              <p>Error loading owned collections: {error}</p>
            ) : realUserNFTAssets.length > 0 ? (
              realUserNFTAssets.map((nft) => (
                <div
                  key={nft.assetId}
                  onClick={() => trackAssetClick({ asset_id: nft.assetId })}
                >
                  <NFTCard nft={nft} />
                </div>
              ))
            ) : (
              <p>No owned collections found.</p>
            )}
          </div>
        </section>

        {/* My Physicalization Orders (用户视角) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-text-primary">
              My Physicalization Orders
            </h2>
          </div>
          {isLoading ? (
            <p className="text-text-secondary">Loading your orders...</p>
          ) : realUserNFTAssets.length > 0 ? (
            <div className="space-y-4">
              {realUserNFTAssets.map((nft) => (
                <OrderCard
                  key={`${nft.collection.address}-${nft.tokenId}`}
                  collectionAddress={nft.collection.address}
                  tokenId={nft.tokenId}
                  isCreator={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[rgba(12,12,14,0.78)] rounded-[16px] border border-[rgba(38,39,43,0.75)]">
              <Package className="h-12 w-12 mx-auto text-text-secondary/30 mb-3" />
              <p className="text-text-secondary">
                You haven&apos;t requested any physicalization yet.
              </p>
            </div>
          )}
        </section>

        {/* Orders to Process (创作者视角) */}
        {collectionAddresses.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-text-primary">
                Orders to Process
                <span className="text-sm font-normal text-text-secondary ml-2">
                  (Creator View)
                </span>
              </h2>
            </div>
            {isLoading ? (
              <p className="text-text-secondary">
                Loading orders to process...
              </p>
            ) : realUserNFTAssets.length > 0 ? (
              <div className="space-y-4">
                {realUserNFTAssets.map((nft) => (
                  <OrderCard
                    key={`creator-${nft.collection.address}-${nft.tokenId}`}
                    collectionAddress={nft.collection.address}
                    tokenId={nft.tokenId}
                    isCreator={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[rgba(12,12,14,0.78)] rounded-[16px] border border-[rgba(38,39,43,0.75)]">
                <Package className="h-12 w-12 mx-auto text-text-secondary/30 mb-3" />
                <p className="text-text-secondary">
                  No physicalization orders to process yet.
                </p>
                <p className="text-text-secondary/70 text-sm mt-1">
                  Orders will appear here when buyers request physicalization
                  for your collections.
                </p>
              </div>
            )}
          </section>
        )}

        <section className="space-y-4">
          <h2 className="font-display text-2xl text-text-primary">Activity</h2>
          <div className="space-y-3">
            {profileActivity.map((event) => (
              <div
                key={event.id}
                className="rounded-[16px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-5 text-sm text-text-secondary"
              >
                <div className="flex items-center justify-between">
                  <p className="text-text-primary">{event.description}</p>
                  {/* <time className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                    {new Date(event.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time> */}
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
