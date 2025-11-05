"use client";

import React, { useEffect, useMemo } from "react";
import { ContentResponseDto, CreateContentRequest } from "@/lib/types/aisam-types";
import { useTeamBrands } from "@/hooks/use-team-brands";
import { useTeamProducts } from "@/hooks/use-team-products";
import { ContentFormShared } from "./content-form-shared";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { AlertCircle } from "lucide-react";

interface TeamContentFormProps {
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
  teamId: string; // Required for team form
  defaultBrandId?: string;
}

export function TeamContentForm({
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
  teamId,
  defaultBrandId
}: TeamContentFormProps) {
  // Only fetch team brands - no all brands fetch
  const { data: teamBrands = [], isLoading: brandsLoading } = useTeamBrands(teamId);
  
  // Get team products - filter by selected brand or all team brands
  // Always pass teamId to enable the query, and pass brandId to filter
  const { data: teamProducts = [], isLoading: productsLoading } = useTeamProducts(
    teamId, // Always pass teamId to enable query
    formData.brandId || undefined // Pass brandId to filter products by brand
  );

  // Transform brands to match expected format
  const brands = useMemo(() => {
    return teamBrands.map((brand: { id: string; name: string }) => ({
      id: brand.id,
      name: brand.name
    }));
  }, [teamBrands]);

  // Transform products to match expected format
  const products = useMemo(() => {
    return teamProducts.map((product: { id: string; name: string; brandId: string }) => ({
      id: product.id,
      name: product.name,
      brandId: product.brandId
    }));
  }, [teamProducts]);

  // Auto-select default brand or first team brand in create mode
  useEffect(() => {
    if (isCreateMode && brands.length > 0 && !formData.brandId) {
      const brandToSelect = defaultBrandId && brands.find(b => b.id === defaultBrandId)
        ? defaultBrandId
        : brands[0]?.id || '';
      if (brandToSelect) {
        setFormData({ ...formData, brandId: brandToSelect });
      }
    }
  }, [isCreateMode, brands, defaultBrandId, formData, setFormData]);

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

  if (teamBrands.length === 0) {
    return (
      <div className={`space-y-4 pb-4 ${className || ''}`}>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Team Brands Available</h3>
          <p className="text-muted-foreground">
            This team doesn&apos;t have any brands assigned. Please assign brands to the team first.
          </p>
        </div>
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

