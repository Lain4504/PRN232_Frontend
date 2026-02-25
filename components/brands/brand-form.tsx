"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Plus,
  Loader2,
} from "lucide-react";
import { Brand, CreateBrandForm as CreateBrandFormType } from "@/lib/types/omniadly-types";
import { toast } from "sonner";
import { useCreateBrand, useUpdateBrand } from "@/hooks/use-brands";

interface BrandFormProps {
  mode: 'create' | 'edit';
  brand?: Brand;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BrandForm({ mode, brand, onSuccess, onCancel }: BrandFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateBrandFormType>({
    name: '',
    description: '',
    slogan: '',
    target_audience: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand(brand?.id || '');

  useEffect(() => {
    if (mode === 'edit' && brand) {
      setFormData({
        name: brand.name,
        description: brand.description || '',
        slogan: brand.slogan || '',
        target_audience: brand.target_audience || '',
      });
      const existingLogo = brand.logo_url || brand.logoUrl || null;
      if (existingLogo) setLogoPreview(existingLogo as string);
    }
  }, [mode, brand]);

  const handleInputChange = (field: keyof CreateBrandFormType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Vui lòng nhập tên thương hiệu");

    try {
      setSubmitting(true);
      if (mode === 'create') await createBrandMutation.mutateAsync(formData);
      else await updateBrandMutation.mutateAsync(formData);
      toast.success("Đã lưu thông tin thương hiệu");
      onSuccess?.();
    } catch {
      toast.error("Đã xảy ra lỗi khi lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-4">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="relative group shrink-0">
          <Avatar className="size-24 rounded-lg border border-border overflow-hidden cursor-pointer bg-muted/30 hover:border-primary/50 transition-all" onClick={() => document.getElementById('logo-upload')?.click()}>
            {logoPreview ? (
              <AvatarImage src={logoPreview} className="object-cover" />
            ) : (
              <AvatarFallback className="flex flex-col items-center justify-center text-muted-foreground bg-transparent">
                <Upload className="size-5 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Logo</span>
              </AvatarFallback>
            )}
          </Avatar>
          <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} className="hidden" />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute -bottom-2 -right-2 size-8 rounded-full shadow-md border-2 border-background"
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-4 w-full">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground">Tên thương hiệu</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ví dụ: OmniAdly, TechFlow..."
              required
              className="h-10 rounded-md border-border bg-card px-4 focus-visible:ring-primary font-medium text-foreground shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground">Slogan / Khẩu hiệu</Label>
            <Input
              value={formData.slogan}
              onChange={(e) => handleInputChange('slogan', e.target.value)}
              placeholder="Câu khẩu hiệu truyền cảm hứng..."
              className="h-10 rounded-md border-border bg-card px-4 focus-visible:ring-primary font-medium text-foreground shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-muted-foreground">Sứ mệnh / Mô tả thương hiệu</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Giới thiệu về tầm nhìn và giá trị cốt lõi của thương hiệu..."
          rows={3}
          className="rounded-md border-border bg-card p-4 focus-visible:ring-primary font-medium text-foreground shadow-sm resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-muted-foreground">Phân khúc Khách hàng mục tiêu</Label>
        <Textarea
          value={formData.target_audience}
          onChange={(e) => handleInputChange('target_audience', e.target.value)}
          placeholder="Mô tả chân dung khách hàng lý tưởng mà thương hiệu hướng tới..."
          rows={3}
          className="rounded-md border-border bg-card p-4 focus-visible:ring-primary font-medium text-foreground shadow-sm resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="h-10 px-6 rounded-md font-semibold text-sm"
        >
          Hủy bỏ
        </Button>
        <Button type="submit" disabled={submitting} className="h-10 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all border-none">
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            mode === 'create' ? 'Tạo thương hiệu' : 'Lưu thay đổi'
          )}
        </Button>
      </div>
    </form>
  )
}
