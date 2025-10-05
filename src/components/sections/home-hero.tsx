"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function HomeHero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden pb-16 pt-20">
      <Container className="grid items-center gap-16 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <span className="text-xs uppercase tracking-[0.3em] text-text-secondary/70">
            Creator workshop + marketplace
          </span>
          <h1 className="font-display text-5xl leading-tight text-text-primary md:text-6xl">
            Forge collectible realities that live on-chain and off-world.
          </h1>
          <p className="max-w-xl text-lg text-text-secondary">
            Kaiwu lets artists mint limited editions, host high-fidelity
            auctions, and bundle physical redemptions without leaving the studio
            workflow.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => router.push("/market")}>Explore Now</Button>
            <Button variant="tertiary" onClick={() => router.push("/creator")}>
              Generate with AI
            </Button>
          </div>

          <dl className="grid gap-6 sm:grid-cols-3">
            {[
              { label: "Artists onboarded", value: "480+" },
              { label: "Physical redemptions", value: "1.2K" },
              { label: "Chains supported", value: "3" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[14px] border border-[rgba(38,39,43,0.75)] bg-[rgba(12,12,14,0.78)] px-5 py-4"
              >
                <dt className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">
                  {item.label}
                </dt>
                <dd className="mt-2 font-display text-2xl text-text-primary">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-[rgba(207,175,109,0.18)] blur-3xl" />
          <div className="relative overflow-hidden rounded-[24px] border border-[rgba(207,175,109,0.22)] bg-[linear-gradient(145deg,rgba(24,20,30,0.92),rgba(10,10,11,0.85))] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.55)]">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[18px]">
              <Image
                src="https://equal-brown-cougar.myfilebase.com/ipfs/QmaQgXPonpBwDqLsKjgGSbabNSZFNTZuGDPcGLcahKyki2"
                alt="Kaiwu hero artwork"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Ethereal No.37</p>
                <p className="text-base font-semibold text-text-primary">
                  Aurora Nyx
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => router.push("/product/drop-ethereal-37")}
              >
                View Drop
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
