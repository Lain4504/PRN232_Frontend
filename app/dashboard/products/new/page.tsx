import type { Metadata } from "next";
import { CreateProductForm } from "@/components/pages/products/create-product-form";

export const metadata: Metadata = {
  title: "Create Product | AISAM",
  description: "Add a new product to your catalog",
};

export default function CreateProductPage() {
  return <CreateProductForm />;
}
