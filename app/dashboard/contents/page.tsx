"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/use-brands";

export default function ContentsRedirectPage() {
  const router = useRouter();
  const { data: brands } = useBrands();

  useEffect(() => {
    if (brands && brands.length > 0) {
      // Redirect to the first brand's content page
      const firstBrand = Array.isArray(brands) ? brands[0] : (brands as { data?: { id: string; name: string }[] })?.data?.[0];
      if (firstBrand) {
        router.replace(`/dashboard/brands/${firstBrand.id}/contents`);
      }
    }
  }, [brands, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to content management...</p>
      </div>
    </div>
  );
}
