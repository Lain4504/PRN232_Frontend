"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brand, Product, CreateProductForm } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useBrands } from "@/hooks/use-brands";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { Loader2, Package, DollarSign, Tag, Upload, Image as ImageIcon } from "lucide-react";

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: Product;
  defaultBrandId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ mode, product, defaultBrandId, onSuccess, onCancel }: ProductFormProps) {
  const [brandContextProcessed, setBrandContextProcessed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateProductForm>({
    brand_id: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    tags: [],
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Hooks
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
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
          category: product.category || '',
          tags: product.tags || [],
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

  return (
    <div className="space-y-6 p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="brand">Brand *</Label>
          {brandsLoaded ? (
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
          ) : (
            <div className="h-10 bg-muted animate-pulse rounded-md"></div>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., 'Premium Wireless Headphones'"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe your product features, benefits, and specifications..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Price *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price?.toString() || ''}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              type="text"
              placeholder="e.g., 'Electronics', 'Clothing'"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="tags"
              type="text"
              placeholder="e.g., 'wireless, bluetooth, premium' (comma-separated)"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => handleInputChange('tags', e.target.value ? e.target.value.split(',').map(tag => tag.trim()) : [])}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Separate tags with commas for better categorization
          </p>
        </div>

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



        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
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
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}