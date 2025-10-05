import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { featuredArtists } from "@/data/mock-data";
import { formatNumber } from "@/lib/utils";

export function FeaturedArtists() {
  return (
    <section className="py-16">
      <Container>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-text-primary">
              Featured Artists
            </h2>
            <p className="mt-2 max-w-lg text-text-secondary">
              Discover the creators shaping Kaiwu&apos;s physical-digital
              futures. Follow to get early access to drops and blind capsules.
            </p>
          </div>
          <Button variant="tertiary" className="hidden sm:inline-flex">
            View All
          </Button>
        </div>

        <div className="mt-10 overflow-x-auto pb-2">
          <div className="flex min-w-full gap-6">
            {featuredArtists.map((artist) => (
              <article
                key={artist.id}
                className="min-w-[280px] flex-1 rounded-[16px] border border-[rgba(38,39,43,0.85)] bg-[rgba(18,18,21,0.88)] p-6 transition hover:-translate-y-1 hover:border-[rgba(207,175,109,0.55)]"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[rgba(207,175,109,0.35)]">
                    <Image
                      src={artist.avatar}
                      alt={artist.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {artist.name}
                      </h3>
                      {artist.verified ? (
                        <Badge variant="gold">Verified</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-text-secondary/80">
                      {formatNumber(artist.followers ?? 0)} followers
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm text-text-secondary">
                  {artist.description}
                </p>
                <div className="mt-6 flex justify-between">
                  <Button size="sm" variant="secondary">
                    Follow
                  </Button>
                  <Button size="sm" variant="tertiary">
                    View Works
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
