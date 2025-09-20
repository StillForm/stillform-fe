"use client";

import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export function CreatorCta() {
  const router = useRouter();
  return (
    <section className="py-20">
      <Container className="grid gap-12 rounded-[20px] border border-[rgba(207,175,109,0.3)] bg-[linear-gradient(140deg,rgba(26,20,36,0.92),rgba(10,10,11,0.85))] px-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <h2 className="font-display text-3xl text-text-primary">
            Creator Studio: craft, mint, and pair physical redemption flows.
          </h2>
          <p className="text-lg text-text-secondary">
            Manage drafts, configure multi-chain releases, and spin up AI reference boards without
            leaving your workflow. Stillform writes provenance metadata and redemption logic for you.
          </p>
          <Button size="lg" variant="secondary" className="w-fit" onClick={() => router.push("/creator")}
          >
            Enter Creator Studio
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            {
              title: "Dual minting",
              description: "Mint on EVM, Solana, and Sui with unified metadata + store physical proofs.",
            },
            {
              title: "Redemption flows",
              description: "Collectors request, track, and confirm shipments without leaving the asset page.",
            },
            {
              title: "AI companions",
              description: "Generate lighting studies and promo frames seeded with collection DNA.",
            },
            {
              title: "Analytics",
              description: "Monitor bids, drops, and physical conversions in real time.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[16px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] p-5"
            >
              <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
