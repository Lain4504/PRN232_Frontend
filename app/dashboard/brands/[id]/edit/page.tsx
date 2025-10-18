import { EditBrandForm } from "@/components/pages/brands/edit-brand-form";

export default function EditBrandPage({ params }: { params: { id: string } }) {
  return <EditBrandForm brandId={params.id} />;
}