import type { Metadata } from "next";
import { BrandsManagement } from "@/components/pages/brands/brands-management";

export const metadata: Metadata = {
  title: "Brands Management | AISAM",
  description: "Manage your brands and brand assets",
};

export default function BrandsPage() {
  return <BrandsManagement />;
}
