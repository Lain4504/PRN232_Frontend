import type { Metadata } from "next";
import { EditProductForm } from "@/components/pages/products/edit-product-form";

export const metadata: Metadata = {
  title: "Edit Product | AISAM",
  description: "Edit product information",
};

export default function EditProductPage() {
  return <EditProductForm />;
}
