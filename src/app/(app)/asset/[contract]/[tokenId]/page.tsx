import { notFound } from "next/navigation";
import { assetDetails } from "@/data/mock-data";
import { AssetDetailView } from "@/components/pages/asset-detail-view";

interface AssetPageProps {
  params: Promise<{ contract: string; tokenId: string }>;
}

export default async function AssetPage({ params }: AssetPageProps) {
  const { tokenId } = await params;
  const asset = assetDetails[tokenId];

  if (!asset) {
    notFound();
  }

  const ownerAddress = "0x12c4E98B819c5497983AB42fF119d8Df671249d2";

  return <AssetDetailView asset={asset} ownerAddress={ownerAddress} />;
}
