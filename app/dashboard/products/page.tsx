import type { Metadata } from "next";
import { ProductsManagement } from "@/components/pages/products/products-management";

export const metadata: Metadata = {
  title: "Products | AISAM",
  description: "Manage your products and inventory",
};

export default function ProductsPage() {
  return <ProductsManagement />;
}
