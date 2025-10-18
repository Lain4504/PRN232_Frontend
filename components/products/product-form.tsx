"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brand, Product } from "@/lib/types/aisam-types";
import { brandApi, productApi } from "@/lib/mock-api";
import { toast } from "sonner";
import { Loader2, Package, DollarSign, Tag, Image as ImageIcon } from "lucide-react";

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ mode, product, onSuccess, onCancel }: ProductFormProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [brandsLoaded, setBrandsLoaded] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setBrandsLoaded(false);
        const response = await brandApi.getBrands();
        if (response.success) {
          setBrands(response.data);

          if (mode === 'edit' && product) {
            // Pre-fill form for edit mode
            setSelectedBrandId(product.brand_id);
            setName(product.name);
            setDescription(product.description || "");
            setPrice(product.price?.toString() || "");
            setImagePreviews(product.images || []);
          } else {
            // For create mode, check localStorage for brand context
            const brandContext = localStorage.getItem('createProductBrandContext');
            
            if (brandContext && response.data.find(b => b.id === brandContext)) {
              setSelectedBrandId(brandContext);
              localStorage.removeItem('createProductBrandContext');
            } else if (response.data.length > 0) {
              setSelectedBrandId(response.data[0].id);
            }
          }
          
          setBrandsLoaded(true);
        } else {
          toast.error("Failed to load brands.");
          setBrandsLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load brands:", error);
        toast.error("Failed to load brands.");
        setBrandsLoaded(true);
      }
    };
    loadBrands();
  }, [mode, product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBrandId) {
      setError("Please select a brand.");
      return;
    }

    if (!name || !description || !price) {
      setError("Please fill in all required fields.");
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      setError("Please enter a valid price.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const productData = {
        brand_id: selectedBrandId,
        name,
        description,
        price: priceValue,
        category: category || undefined,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined,
        images: imageFiles,
      };

      let response;
      if (mode === 'create') {
        response = await productApi.createProduct(productData);
      } else {
        response = await productApi.updateProduct(product!.id, productData);
      }

      if (response.success) {
        toast.success(`Product ${mode === 'create' ? 'created' : 'updated'} successfully!`);
        onSuccess?.();
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      toast.error("An unexpected error occurred.");
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
              key={`brand-select-${selectedBrandId}`} 
              value={selectedBrandId} 
              onValueChange={setSelectedBrandId}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe your product features, benefits, and specifications..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Separate tags with commas for better categorization
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="images">Product Images</Label>
          <div className="space-y-4">
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={preview} alt={`Product image ${index + 1}`} />
                      <AvatarFallback>
                        <ImageIcon className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === 'create' 
              ? 'Upload multiple images to showcase your product from different angles'
              : 'Upload additional images or remove existing ones'
            }
          </p>
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