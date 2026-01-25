"use client";

import React, { useMemo } from "react";
import { ContentResponseDto, CreateContentRequest } from "@/lib/types/aisam-types";
import { useBrands } from "@/hooks/use-brands";
import { useProducts } from "@/hooks/use-products";
import { ContentFormShared } from "./content-form-shared";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

interface ProfileContentFormProps {
  formData: CreateContentRequest;
  setFormData: (data: CreateContentRequest) => void;
  content: ContentResponseDto | null;
  isEditing: boolean;
  isCreateMode: boolean;
  handleSave: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  isProcessing: boolean;
  onSubmit?: (contentId: string) => Promise<void>;
  className?: string;
  showButtons?: boolean;
  onSelectImages: (files: FileList | null) => void;
  onSelectVideo: (file: File | null) => void;
  imagePreviews: string[];
  videoPreview: string | null;
  brands?: Array<{ id: string; name: string }>; // Optional: pass brands from parent
  products?: Array<{ id: string; name: string; brandId: string }>; // Optional: pass products from parent
  defaultBrandId?: string;
}

export function ProfileContentForm({
  formData,
  setFormData,
  content,
  isEditing,
  isCreateMode,
  handleSave,
  handleSubmit,
  isProcessing,
  onSubmit,
  className,
  showButtons = true,
  onSelectImages,
  onSelectVideo,
  imagePreviews,
  videoPreview,
  brands: providedBrands,
  products: providedProducts,
  defaultBrandId
}: ProfileContentFormProps) {
  // Fetch all brands if not provided
  const shouldFetchBrands = !providedBrands;
  const { data: allBrands = [], isLoading: brandsLoading } = useBrands(undefined, shouldFetchBrands);

  // Fetch all products if not provided
  const shouldFetchProducts = !providedProducts;
  const { data: allProducts = [], isLoading: productsLoading } = useProducts(undefined, shouldFetchProducts);

  // Use provided brands/products or fetch all
  const brands = useMemo(() => {
    if (providedBrands) return providedBrands;
    return allBrands.map((brand: { id: string; name: string }) => ({
      id: brand.id,
      name: brand.name
    }));
  }, [providedBrands, allBrands]);

  const products = useMemo(() => {
    if (providedProducts) return providedProducts;
    return allProducts.map((product: { id: string; name: string; brandId: string }) => ({
      id: product.id,
      name: product.name,
      brandId: product.brandId
    }));
  }, [providedProducts, allProducts]);

  if (brandsLoading || productsLoading) {
    return (
      <div className={`space-y-4 pb-4 ${className || ''}`}>
        <LoadingSkeleton className="h-6 w-32" />
        <div className="grid gap-4 md:grid-cols-2">
          <LoadingSkeleton className="h-10 w-full" />
          <LoadingSkeleton className="h-10 w-full" />
        </div>
        <LoadingSkeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <ContentFormShared
      formData={formData}
      setFormData={setFormData}
      content={content}
      isEditing={isEditing}
      isCreateMode={isCreateMode}
      brands={brands}
      products={products}
      handleSave={handleSave}
      handleSubmit={handleSubmit}
      isProcessing={isProcessing}
      onSubmit={onSubmit}
      className={className}
      showButtons={showButtons}
      onSelectImages={onSelectImages}
      onSelectVideo={onSelectVideo}
      imagePreviews={imagePreviews}
      videoPreview={videoPreview}
    />
  );
}

