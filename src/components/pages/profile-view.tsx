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
import { useMemo } from "react";
import { useUserAssets } from "@/lib/services";
import { Twitter, Globe, MessageCircle, Instagram } from "lucide-react";

interface ProfileView {
  address: `0x${string}`;
}

export function ProfileView({ address }: ProfileView) {
  const { assets } = useAssetStore();
  const trackAssetClick = useAnalytics("profile_asset_click");

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

  console.log("ownedAddress", userNFTAssets);

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
            ) : userNFTAssets.length > 0 ? (
              userNFTAssets.map((nft) => (
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
                  <time className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                    {new Date(event.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
