import { HomeHero } from "@/components/sections/home-hero";
import { FeaturedArtists } from "@/components/sections/featured-artists";
import { TrendingDrops } from "@/components/sections/trending-drops";
import { GlobalActivityTicker } from "@/components/sections/global-activity";
import { CreatorCta } from "@/components/sections/creator-cta";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <HomeHero />
      <GlobalActivityTicker />
      <TrendingDrops />
      <FeaturedArtists />
      <CreatorCta />
    </main>
  );
}
