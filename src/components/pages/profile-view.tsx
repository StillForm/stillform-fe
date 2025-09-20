"use client";

import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AssetCard } from "@/components/cards/asset-card";
import { profileSummary, profileAssets, profileActivity } from "@/data/mock-data";
import { truncateAddress } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/lib/analytics";

export function ProfileView() {
  const trackAssetClick = useAnalytics("profile_asset_click");

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
              <Image src={profileSummary.avatar} alt={profileSummary.handle} fill className="object-cover" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl text-text-primary">{profileSummary.handle}</h1>
                <Badge variant="gold">Creator</Badge>
              </div>
              <p className="text-sm text-text-secondary">{profileSummary.bio}</p>
              <div className="flex flex-wrap gap-2 text-sm text-text-secondary">
                <span>{truncateAddress(profileSummary.address, 6)}</span>
                <span>•</span>
                <a href={profileSummary.socials[0]?.url} className="text-gold hover:text-gold/80">
                  {profileSummary.socials[0]?.platform}
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Follow</Button>
            <Button variant="tertiary">Share Profile</Button>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Collectibles", value: profileSummary.stats.collectibles },
            { label: "Created", value: profileSummary.stats.created },
            { label: "Redeemed", value: profileSummary.stats.redeemed },
            { label: "Followers", value: profileSummary.stats.followers },
            { label: "Following", value: profileSummary.stats.following },
          ].map((stat) => (
            <Card key={stat.label} className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                {stat.label}
              </p>
              <p className="text-2xl text-text-primary">{stat.value}</p>
            </Card>
          ))}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-text-primary">Collected works</h2>
            <Button variant="tertiary">View all</Button>
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {profileAssets.map((asset) => (
              <div key={asset.id} onClick={() => trackAssetClick({ asset_id: asset.id })}>
                <AssetCard asset={asset} />
              </div>
            ))}
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
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
