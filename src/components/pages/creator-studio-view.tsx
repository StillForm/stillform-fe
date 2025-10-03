"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { creatorDrafts } from "@/data/mock-data";
import { useModalStore } from "@/lib/stores/modal-store";
import { formatNumber } from "@/lib/utils";
import { useAssetStore } from "@/lib/stores/assset-store";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { AssetCard } from "../cards/assetCard";

export function CreatorStudioView() {
  const router = useRouter();
  const { openModal } = useModalStore();
  const { assets } = useAssetStore();
  const { address } = useAccount();

  const creatorCollections = useMemo(() => {
    return assets.filter((asset) => asset.artist.id === address);
  }, [assets, address]);

  return (
    <Container className="space-y-12 py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-text-secondary/70">
            Creator Studio
          </p>
          <h1 className="mt-3 font-display text-4xl text-text-primary">
            Manage your releases and physical redemptions
          </h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            Draft new works, trigger AI assisted concept boards, and monitor how
            collectors redeem physical counterparts across chains.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              router.push("/creator/ai");
            }}
          >
            Generate with AI
          </Button>
          <Button
            onClick={() => {
              openModal("creatorNew", {});
            }}
          >
            New Work
          </Button>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-text-primary">
            Collections
          </h2>
          <Button variant="tertiary">View analytics</Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {creatorCollections.map((collection) => (
            <AssetCard
              key={collection.id}
              asset={collection}
              className="w-full h-[720px] w-[438px]"
            />
          ))}
        </div>
      </section>

      {/* TODO: 草稿态设计到同一个作品的状态修改，但是现阶段所有的产品全部都在链上，改动成本极其昂贵，所以这里等有了后端之后再实现 */}
      {/* <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-text-primary">Drafts</h2>
          <Button
            variant="tertiary"
            onClick={() => openModal("creatorDraft", {})}
          >
            Manage drafts
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {creatorDrafts.map((draft) => (
            <Card key={draft.id} interactive className="space-y-4 p-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px]">
                <Image
                  src={draft.thumbnail}
                  alt={draft.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-text-primary">
                  {draft.title}
                </h3>
                <p className="text-sm text-text-secondary">Updated </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    openModal("creatorDraft", { draftId: draft.id })
                  }
                >
                  Edit draft
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section> */}

      <section className="space-y-6">
        <h2 className="font-display text-2xl text-text-primary">
          Studio stats
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total collectors", value: 9870 },
            { label: "Physical conversions", value: 312 },
            { label: "AI boards generated", value: 128 },
            { label: "Active auctions", value: 6 },
          ].map((metric) => (
            <Card key={metric.label} className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                {metric.label}
              </p>
              <p className="text-2xl text-text-primary">
                {formatNumber(metric.value)}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </Container>
  );
}
