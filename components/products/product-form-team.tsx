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
import { useTeamBrands } from "@/hooks/use-team-brands";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { Loader2, Package, Upload, Image as ImageIcon, Tag, AlignLeft, ChevronRight, Check, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamProductFormProps {
  mode: 'create' | 'edit';
  product?: Product;
  defaultBrandId?: string;
  teamId: string;
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

  const { data: teamBrands = [], isLoading: teamBrandsLoading } = useTeamBrands(teamId);
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct(product?.id || '');
  const brandsLoaded = !teamBrandsLoading;

  useEffect(() => {
    if (teamBrands.length > 0) {
      if (mode === 'edit' && product) {
        setFormData({
          brand_id: product.brandId,
          name: product.name,
          description: product.description || '',
          price: product.price || 0,
        });
        if (product.images && product.images.length > 0) setImagePreview(product.images[0]);
      } else {
        if (defaultBrandId && teamBrands.find(b => b.id === defaultBrandId)) {
          setFormData(prev => ({ ...prev, brand_id: defaultBrandId }));
          setBrandContextProcessed(true);
        } else if (teamBrands.length > 0) {
          setFormData(prev => ({ ...prev, brand_id: teamBrands[0].id }));
        }
      }
    }
  }, [teamBrands, mode, product, defaultBrandId, brandContextProcessed]);

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
    if (!formData.brand_id) return toast.error('Vui lòng chọn thương hiệu chủ quản');

    if (!teamBrands.find(b => b.id === formData.brand_id)) {
      toast.error('Thương hiệu được chọn không thuộc đội ngũ này');
      return;
    }

    try {
      setIsLoading(true);
      if (mode === 'create') await createProductMutation.mutateAsync(formData);
      else await updateProductMutation.mutateAsync(formData);
      toast.success('Thao tác thành công!');
      onSuccess?.();
    } catch (error) {
      toast.error('Lỗi khi lưu thông tin sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  if (teamBrandsLoading) {
    return (
      <div className="space-y-8 p-4">
        {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} className="h-14 w-full rounded-2xl" />)}
      </div>
    );
  }

  if (teamBrands.length === 0) {
    return (
      <div className="py-20 px-8 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
        <Boxes className="size-16 text-slate-200 mx-auto mb-6" />
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Đội ngũ trống Thương hiệu</h3>
        <p className="text-sm font-medium text-slate-400 italic max-w-xs mx-auto">
          Đội ngũ này chưa được gán thương hiệu nào. Vui lòng thiết lập liên kết thương hiệu trước khi tạo sản phẩm.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-4">
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Gán vào Thương hiệu Đội ngũ</Label>
          {brandsLoaded ? (
            <Select
              key={`team-brand-select-${formData.brand_id}`}
              value={formData.brand_id}
              onValueChange={(value) => handleInputChange('brand_id', value)}
              disabled={!!defaultBrandId}
            >
              <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 focus:ring-0 shadow-sm font-black text-slate-900 uppercase tracking-tight transition-all">
                <SelectValue placeholder="Lựa chọn thương hiệu nội bộ..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                {teamBrands.map((brand: Brand) => (
                  <SelectItem key={brand.id} value={brand.id} className="rounded-xl h-11 uppercase font-black text-[10px] tracking-widest focus:bg-slate-50">
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <LoadingSkeleton className="h-14 w-full rounded-2xl" />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Tên sản phẩm thương mại</Label>
            <div className="relative group">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
              <Input
                placeholder="Ví dụ: High-End Mechanical Keyboard..."
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus-visible:ring-slate-100 font-black text-slate-900 uppercase tracking-tight transition-all"
                required
              />
            </div>
          </div>
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Niêm yết (VNĐ)</Label>
            <Input
              type="number"
              step="1000"
              min="0"
              placeholder="0"
              value={formData.price?.toString() || ''}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              className="h-14 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus-visible:ring-slate-100 font-black text-slate-900 text-right pr-6"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Đặc tính & Nội dung</Label>
          <div className="relative group">
            <AlignLeft className="absolute left-6 top-6 size-5 text-slate-300 pointer-events-none" />
            <Textarea
              placeholder="Mô tả kỹ thuật cho đội ngũ sản xuất nội dung..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={5}
              className="pl-16 pt-6 rounded-2xl border-2 border-slate-100 bg-white p-6 focus-visible:ring-slate-100 font-medium text-slate-900 shadow-sm leading-relaxed"
              required
            />
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
          <div className="flex items-center gap-3">
            <ImageIcon className="size-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hình ảnh đại diện Đội ngũ</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative group">
              <Avatar className="size-32 rounded-2xl border-4 border-white shadow-2xl ring-4 ring-slate-100 transition-transform group-hover:scale-105 duration-500">
                {imagePreview ? (
                  <AvatarImage src={imagePreview} alt="Preview" className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-white">
                    <Package className="size-10 text-slate-200" />
                  </AvatarFallback>
                )}
              </Avatar>
              {imagePreview && (
                <div className="absolute -top-2 -right-2 size-8 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg border-4 border-white animate-in zoom-in duration-300">
                  <Check className="size-4" />
                </div>
              )}
            </div>

            <div className="space-y-4 flex-1">
              <input type="file" id="team-product-image" accept="image/*" onChange={handleImageChange} className="hidden" />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('team-product-image')?.click()}
                className="h-12 px-8 rounded-xl border-slate-200 bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-slate-50 transition-all"
              >
                <Upload className="mr-3 size-4" />
                Tải lên Asset
              </Button>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Đội ngũ có thể truy cập chung vào tài sản này.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button type="submit" disabled={isLoading} className="h-16 flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-3 size-5 animate-spin" />
                Đang xử lý nội bộ...
              </>
            ) : (
              <>
                {mode === 'create' ? 'Tạo thực thể sản phẩm' : 'Lưu lại thay đổi'} <ChevronRight className="ml-2 size-5" />
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 font-black uppercase tracking-widest text-[11px] sm:px-12">
            Hủy bỏ
          </Button>
        </div>
      </form>
    </div>
  );
}
