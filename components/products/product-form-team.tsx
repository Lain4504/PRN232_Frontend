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
import { Product, CreateProductForm, Brand } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useTeamBrands } from "@/hooks/use-team-brands";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { Loader2, Package, Upload, Image as ImageIcon } from "lucide-react";

interface TeamProductFormProps {
  mode: 'create' | 'edit';
  product?: Product;
  defaultBrandId?: string;
  teamId: string; // Required for team form
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TeamProductForm({ mode, product, defaultBrandId, teamId, onSuccess, onCancel }: TeamProductFormProps) {
  const [brandContextProcessed, setBrandContextProcessed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProductForm>({
    brand_id: '',
    name: '',
    description: '',
    price: 0,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Only fetch team brands - no all brands fetch
  const { data: teamBrands = [], isLoading: teamBrandsLoading } = useTeamBrands(teamId);
  
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct(product?.id || '');

  const brandsLoaded = !teamBrandsLoading;

  useEffect(() => {
    if (teamBrands.length > 0) {
      if (mode === 'edit' && product) {
        // Pre-fill form for edit mode
        setFormData({
          brand_id: product.brandId,
          name: product.name,
          description: product.description || '',
          price: product.price || 0,
        });
        
        if (product.images && product.images.length > 0) {
          setImagePreview(product.images[0]);
        }
      } else {
        // For create mode, prioritize defaultBrandId, then first team brand
        if (defaultBrandId && teamBrands.find(b => b.id === defaultBrandId)) {
          setFormData(prev => ({ ...prev, brand_id: defaultBrandId }));
          setBrandContextProcessed(true);
        } else if (teamBrands.length > 0) {
          // Auto-select first team brand if no defaultBrandId
          setFormData(prev => ({ ...prev, brand_id: teamBrands[0].id }));
        }
      }
    }
  }, [teamBrands, mode, product, defaultBrandId, brandContextProcessed]);

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

    if (!formData.brand_id) {
      toast.error('Please select a brand');
      return;
    }

    // Validate that selected brand is in team brands
    if (!teamBrands.find(b => b.id === formData.brand_id)) {
      toast.error('Selected brand is not part of this team');
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

  if (teamBrandsLoading) {
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

  if (teamBrands.length === 0) {
    return (
      <div className="space-y-6 p-4">
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Team Brands Available</h3>
          <p className="text-muted-foreground mb-4">
            This team doesn&apos;t have any brands assigned. Please assign brands to the team first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Brand" required>
          {brandsLoaded ? (
            teamBrands.length === 1 ? (
              // If only one team brand, show as disabled input
              <Input
                value={teamBrands[0].name}
                disabled
                className="bg-muted"
              />
            ) : (
              <Select 
                key={`team-brand-select-${formData.brand_id}`} 
                value={formData.brand_id} 
                onValueChange={(value) => handleInputChange('brand_id', value)}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select a team brand" />
                </SelectTrigger>
                <SelectContent>
                  {teamBrands.map((brand: Brand) => (
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

