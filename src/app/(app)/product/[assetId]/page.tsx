import { notFound } from "next/navigation";
import { assetDetails } from "@/data/mock-data";
import { ProductDetailView } from "@/components/pages/product-detail-view";

interface ProductPageProps {
  params: Promise<{ assetId: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { assetId } = await params;
  const asset = assetDetails[assetId];

  if (!asset) {
    notFound();
  }

  return <ProductDetailView asset={asset} />;
}
