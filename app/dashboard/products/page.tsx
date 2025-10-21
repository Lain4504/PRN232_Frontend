import type { Metadata } from "next";
import { ProductsManagement } from "@/components/pages/products/products-management";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Products | AISAM",
  description: "Manage your products and inventory",
};

function ProductsLoading() {
  return (
    <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="h-10 w-64 mb-3 bg-muted animate-pulse rounded" />
            <div className="h-5 w-80 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-8 w-28 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsManagement />
    </Suspense>
  );
}
