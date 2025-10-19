import { BrandDetails } from "@/components/pages/brands/brand-details";

export default function BrandPage({ params }: { params: { id: string } }) {
  return <BrandDetails brandId={params.id} />;
}