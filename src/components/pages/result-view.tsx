import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ResultView({ id }: { id: string }) {
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-24">
      <Card className="max-w-xl space-y-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-text-secondary/70">Result</p>
        <h1 className="font-display text-3xl text-text-primary">Blind Capsule Revealed</h1>
        <p className="text-text-secondary">
          Capsule {id} unlocked an Epic rarity. Physical redemption is ready to request in Activity.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/asset/evm/drop-ethereal-37">View asset</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/creator/ai?from=drop-ethereal-37">Create Promo Image with AI</Link>
          </Button>
        </div>
      </Card>
    </Container>
  );
}
