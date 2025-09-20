import { Suspense } from "react";
import { MarketView } from "@/components/pages/market-view";

export default function MarketPage() {
  return (
    <Suspense fallback={null}>
      <MarketView />
    </Suspense>
  );
}
