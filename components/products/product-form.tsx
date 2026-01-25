"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormField } from "@/components/ui/form-field";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Product, CreateProductForm } from "@/lib/types/omniadly-types";
import { toast } from "sonner";
import { useBrands } from "@/hooks/use-brands";
import { useTeamBrands } from "@/hooks/use-team-brands";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { Loader2, Package, Upload, Image as ImageIcon } from "lucide-react";
import { Brand } from "@/lib/types/omniadly-types";

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: Product;
  defaultBrandId?: string;
  brands?: Brand[]; // Optional: pass brands from parent (e.g., team brands)
  teamId?: string; // Optional: if provided, use team brands instead of all brands
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ mode, product, defaultBrandId, brands: providedBrands, teamId, onSuccess, onCancel }: ProductFormProps) {
  const [brandContextProcessed, setBrandContextProcessed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null); // Removed unused variable
  const [formData, setFormData] = useState<CreateProductForm>({
    brand_id: '',
    name: '',
    description: '',
    price: 0,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Hooks - conditionally fetch brands based on context
  // Priority: providedBrands (if provided) > teamBrands (if teamId) > allBrands (only if neither provided)

  // Check if brands are explicitly provided (not undefined)
  const hasProvidedBrands = providedBrands !== undefined;

  // Only fetch team brands if teamId is provided and brands are NOT provided
  const shouldFetchTeamBrands = !!teamId && !hasProvidedBrands;
  const { data: teamBrands = [], isLoading: teamBrandsLoading } = useTeamBrands(shouldFetchTeamBrands ? teamId : undefined);

  // Only fetch all brands if no brands are provided and no teamId
  const shouldFetchAllBrands = !hasProvidedBrands && !teamId;
  const { data: allBrands = [], isLoading: allBrandsLoading } = useBrands(undefined, shouldFetchAllBrands);

  // Determine which brands to use
  // Priority: providedBrands (even if empty array) > teamBrands > allBrands
  const brands = hasProvidedBrands
    ? (providedBrands || []) // Use provided brands (even if empty array)
    : (teamId ? teamBrands : allBrands);

  // Determine loading state
  const brandsLoading = hasProvidedBrands
    ? false // If brands are provided, no loading needed
    : (teamId ? teamBrandsLoading : allBrandsLoading);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct(product?.id || '');

  const brandsLoaded = !brandsLoading;

  useEffect(() => {
    if (brands.length > 0) {
      if (mode === 'edit' && product) {
        // Pre-fill form for edit mode
        setFormData({
          brand_id: product.brandId, // API uses camelCase
          name: product.name,
          description: product.description || '',
          price: product.price || 0,
        });

        if (product.images && product.images.length > 0) {
          setImagePreview(product.images[0]);
        }
      } else {
        // For create mode, prioritize defaultBrandId prop, then localStorage, then first brand
        if (defaultBrandId && brands.find(b => b.id === defaultBrandId)) {
          setFormData(prev => ({ ...prev, brand_id: defaultBrandId }));
          setBrandContextProcessed(true);
        } else {
          const brandContext = localStorage.getItem('createProductBrandContext');

          if (brandContext && brands.find(b => b.id === brandContext)) {
            setFormData(prev => ({ ...prev, brand_id: brandContext }));
            localStorage.removeItem('createProductBrandContext');
            setBrandContextProcessed(true);
          } else if (brands.length > 0 && !brandContextProcessed && !defaultBrandId) {
            // Only auto-select first brand if no brand context was processed and no defaultBrandId
            setFormData(prev => ({ ...prev, brand_id: brands[0].id }));
          }
        }
      }
    }
  }, [brands, mode, product, defaultBrandId, brandContextProcessed]);

  const handleInputChange = (field: keyof CreateProductForm, value: string | number | string[] | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        images: [file]
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.description?.trim()) {
      toast.error('Product description is required');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setIsLoading(true);

      if (mode === 'create') {
        await createProductMutation.mutateAsync(formData);
      } else {
        await updateProductMutation.mutateAsync(formData);
      }

      toast.success(`Product ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      onSuccess?.();
    } catch (error) {
      console.error(`Failed to ${mode} product:`, error);
      toast.error(`Failed to ${mode} product`);
    } finally {
      setIsLoading(false);
    }
  };

  if (brandsLoading) {
    return (
      <div className="space-y-6 p-4">
        <LoadingSkeleton className="h-6 w-32" />
        <div className="grid gap-6 md:grid-cols-2">
          <LoadingSkeleton className="h-10 w-full" />
          <LoadingSkeleton className="h-10 w-full" />
        </div>
        <LoadingSkeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <LoadingSkeleton className="h-10 w-full" />
          <LoadingSkeleton className="h-10 w-full" />
        </div>
        <LoadingSkeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Brand" required>
          {brandsLoaded ? (
            defaultBrandId && brands.length === 1 && brands[0].id === defaultBrandId ? (
              // If only one brand is available and it matches defaultBrandId, show as disabled
              <Input
                value={brands[0].name}
                disabled
                className="bg-muted"
              />
            ) : (
              <Select
                key={`brand-select-${formData.brand_id}`}
                value={formData.brand_id}
                onValueChange={(value) => handleInputChange('brand_id', value)}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          ) : (
            <LoadingSkeleton className="h-10 w-full" />
          )}
        </FormField>

        <FormField label="Product Name" required>
          <Input
            id="name"
            type="text"
            placeholder="e.g., 'Premium Wireless Headphones'"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </FormField>

        <FormField label="Description" required>
          <Textarea
            id="description"
            placeholder="Describe your product features, benefits, and specifications..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            required
          />
        </FormField>

        <FormField label="Price (VND)" required>
          <div className="relative">
            <Input
              id="price"
              type="number"
              step="1000"
              min="0"
              placeholder="0"
              value={formData.price?.toString() || ''}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              required
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              ₫
            </span>
          </div>
        </FormField>

        {/* Product Image Upload */}
        <div className="space-y-3">
          <Label>Product Image</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {imagePreview ? (
                <AvatarImage src={imagePreview} alt="Product preview" />
              ) : (
                <AvatarFallback>
                  <ImageIcon className="h-8 w-8" />
                </AvatarFallback>
              )}
            </Avatar>

            <div>
              <input
                type="file"
                id="product-image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('product-image')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG up to 10MB
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                {mode === 'create' ? 'Create Product' : 'Update Product'}
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
