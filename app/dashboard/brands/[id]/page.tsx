import { BrandDetails } from "@/components/pages/brands/brand-details";

export default async function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BrandDetails brandId={id} />;
}