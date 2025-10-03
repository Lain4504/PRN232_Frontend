import type { Metadata } from "next";
import { CreateBrandForm } from "@/components/pages/brands/create-brand-form";

export const metadata: Metadata = {
  title: "Create Brand | AISAM",
  description: "Create a new brand for your business",
};

export default function CreateBrandPage() {
  return <CreateBrandForm />;
}
