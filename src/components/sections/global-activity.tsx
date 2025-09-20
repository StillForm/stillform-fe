import { Container } from "@/components/layout/container";
import { globalActivity } from "@/data/mock-data";

export function GlobalActivityTicker() {
  return (
    <section className="border-t border-[rgba(38,39,43,0.75)] bg-[rgba(18,18,21,0.88)] py-6">
      <Container className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-xs uppercase tracking-[0.25em] text-text-secondary/70">
          Global Drops
        </div>
        <div className="flex flex-1 items-center gap-6 overflow-x-auto pb-2">
          {globalActivity.map((event) => (
            <div
              key={event.id}
              className="whitespace-nowrap rounded-full border border-[rgba(38,39,43,0.8)] bg-[rgba(12,12,14,0.82)] px-4 py-2 text-sm text-text-secondary"
            >
              {event.description}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
