"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Product, CreateProductForm, Brand } from "@/lib/types/omniadly-types";
import { toast } from "sonner";
import { useBrands } from "@/hooks/use-brands";
import { useTeamBrands } from "@/hooks/use-team-brands";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { Loader2, Package, Upload } from "lucide-react";

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: Product;
  defaultBrandId?: string;
  brands?: Brand[];
  teamId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ mode, product, defaultBrandId, brands: providedBrands, teamId, onSuccess, onCancel }: ProductFormProps) {
  const [brandContextProcessed, setBrandContextProcessed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProductForm>({
    brand_id: '',
    name: '',
    description: '',
    price: 0,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const hasProvidedBrands = providedBrands !== undefined;
  const shouldFetchTeamBrands = !!teamId && !hasProvidedBrands;
  const { data: teamBrands = [], isLoading: teamBrandsLoading } = useTeamBrands(shouldFetchTeamBrands ? teamId : undefined);

  const shouldFetchAllBrands = !hasProvidedBrands && !teamId;
  const { data: allBrands = [], isLoading: allBrandsLoading } = useBrands(undefined, shouldFetchAllBrands);

  const brands = hasProvidedBrands ? (providedBrands || []) : (teamId ? teamBrands : allBrands);
  const brandsLoading = hasProvidedBrands ? false : (teamId ? teamBrandsLoading : allBrandsLoading);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct(product?.id || '');

  useEffect(() => {
    if (brands.length > 0) {
      if (mode === 'edit' && product) {
        setFormData({
          brand_id: product.brandId,
          name: product.name,
          description: product.description || '',
          price: product.price || 0,
        });
        if (product.images && product.images.length > 0) setImagePreview(product.images[0]);
      } else {
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
            setFormData(prev => ({ ...prev, brand_id: brands[0].id }));
          }
        }
      }
    }
  }, [brands, mode, product, defaultBrandId, brandContextProcessed]);

  const handleInputChange = (field: keyof CreateProductForm, value: string | number | string[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, images: [file] }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Vui lòng nhập tên sản phẩm');
    if (!formData.description?.trim()) return toast.error('Vui lòng nhập mô tả sản phẩm');
    if (!formData.price || formData.price <= 0) return toast.error('Vui lòng nhập giá bán hợp lệ');

    try {
      setIsLoading(true);
      if (mode === 'create') await createProductMutation.mutateAsync(formData);
      else await updateProductMutation.mutateAsync(formData);
      toast.success('Đã lưu thông tin sản phẩm');
      onSuccess?.();
    } catch (error) {
      toast.error('Lỗi khi lưu thông tin sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  if (brandsLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-4">
      <div className="space-y-2">
        <Label>Thương hiệu sở hữu</Label>
        <Select
          key={`brand-select-${formData.brand_id}`}
          value={formData.brand_id}
          onValueChange={(value) => handleInputChange('brand_id', value)}
          disabled={!!defaultBrandId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn thương hiệu..." />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label>Tên sản phẩm</Label>
          <Input
            placeholder="Nhập tên sản phẩm..."
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Giá bán (VNĐ)</Label>
          <Input
            type="number"
            step="1000"
            min="0"
            placeholder="0"
            value={formData.price?.toString() || ''}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Mô tả chi tiết</Label>
        <Textarea
          placeholder="Giới thiệu về các tính năng, lợi ích của sản phẩm... "
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="p-4 rounded-lg border bg-slate-50/50 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Package className="size-4" />
          <span>Hình ảnh đại diện</span>
        </div>
        <div className="flex items-center gap-6">
          <Avatar className="size-20 rounded-lg border bg-white overflow-hidden">
            {imagePreview ? (
              <AvatarImage src={imagePreview} alt="Preview" className="object-cover" />
            ) : (
              <AvatarFallback className="text-slate-300">
                <Package className="size-8" />
              </AvatarFallback>
            )}
          </Avatar>

          <div className="space-y-2">
            <input type="file" id="product-image" accept="image/*" onChange={handleImageChange} className="hidden" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('product-image')?.click()}
            >
              <Upload className="mr-2 size-4" />
              {imagePreview ? 'Thay đổi ảnh' : 'Tải lên ảnh'}
            </Button>
            <p className="text-[10px] text-slate-400">JPG, PNG, WEBP. Tối đa 10MB.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            mode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'
          )}
        </Button>
      </div>
    </form>
  );
}
