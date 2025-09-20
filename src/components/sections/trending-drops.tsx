import { Container } from "@/components/layout/container";
import { AssetCard } from "@/components/cards/asset-card";
import { trendingDrops } from "@/data/mock-data";

export function TrendingDrops() {
  return (
    <section className="pb-20">
      <Container>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-text-primary">Trending Drops</h2>
            <p className="mt-2 max-w-2xl text-text-secondary">
              Explore the editions collectors are racing to secure. Auctions update in real time;
              blind capsules sync across chains.
            </p>
          </div>
          <a
            href="/market"
            className="text-sm font-medium text-gold transition hover:text-gold/80"
          >
            View Marketplace →
          </a>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {trendingDrops.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </Container>
    </section>
  );
}
