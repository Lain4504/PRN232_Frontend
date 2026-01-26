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
  Landmark,
  Target,
  Users,
  Sparkles,
  ChevronRight,
  Fingerprint
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
    usp: '',
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
        usp: brand.usp || '',
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
      toast.success("Thao tác thành công!");
      onSuccess?.();
    } catch {
      toast.error("Đã xảy ra lỗi khi lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in duration-500 pb-4">
      <div className="space-y-12">
        {/* Identity Cluster */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 px-1">
            <Fingerprint className="size-4 text-slate-400" />
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Định danh Cốt lõi</Label>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] -rotate-12 group-hover:rotate-0 transition-transform pointer-events-none">
              <Landmark className="size-32 text-slate-900" />
            </div>

            <div className="relative shrink-0">
              <Avatar className="size-32 rounded-[2rem] border-4 border-white shadow-2xl ring-4 ring-slate-100 overflow-hidden cursor-pointer group/avatar transition-transform hover:scale-105 duration-500" onClick={() => document.getElementById('logo-upload')?.click()}>
                {logoPreview ? (
                  <AvatarImage src={logoPreview} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-white flex flex-col items-center justify-center gap-2">
                    <Upload className="size-6 text-slate-200" />
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center px-4">Tải Logo</span>
                  </AvatarFallback>
                )}
              </Avatar>
              <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} className="hidden" />
              <Button
                type="button"
                size="icon"
                className="absolute -bottom-2 -right-2 size-10 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] border-4 border-white bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Plus className="size-5" />
              </Button>
            </div>

            <div className="flex-1 space-y-6 w-full relative z-10">
              <div className="space-y-3">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Tên Thương hiệu</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Vị dụ: Nike, Apple, Omniadly..."
                  className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 focus-visible:ring-slate-100 font-black text-slate-900 uppercase tracking-tight shadow-sm"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Slogan / Khẩu hiệu</Label>
                <Input
                  value={formData.slogan}
                  onChange={(e) => handleInputChange('slogan', e.target.value)}
                  placeholder="Just Do It, Think Different..."
                  className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 focus-visible:ring-slate-100 font-bold text-slate-600 shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Narrative & Strategy Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3 px-1">
              <Sparkles className="size-4 text-slate-400" />
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sứ mệnh & Câu chuyện</Label>
            </div>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả tầm nhìn, sứ mệnh và hành trình của thương hiệu..."
              className="min-h-[140px] rounded-[2rem] border-2 border-slate-100 bg-white p-8 focus-visible:ring-slate-100 font-medium text-slate-900 shadow-sm leading-relaxed"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <Target className="size-4 text-slate-400" />
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Giá trị Độc bản (USP)</Label>
            </div>
            <Textarea
              value={formData.usp}
              onChange={(e) => handleInputChange('usp', e.target.value)}
              placeholder="Điều gì khiến thương hiệu của bạn khác biệt?"
              className="min-h-[160px] rounded-[2rem] border-2 border-slate-100 bg-slate-50/50 p-6 focus-visible:ring-slate-100 font-medium text-slate-900 shadow-sm text-sm"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <Users className="size-4 text-slate-400" />
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Chân dung Khách hàng</Label>
            </div>
            <Textarea
              value={formData.target_audience}
              onChange={(e) => handleInputChange('target_audience', e.target.value)}
              placeholder="Ai là người sẽ yêu thích và tin dùng thương hiệu này?"
              className="min-h-[160px] rounded-[2rem] border-2 border-slate-100 bg-slate-50/50 p-6 focus-visible:ring-slate-100 font-medium text-slate-900 shadow-sm text-sm"
            />
          </div>
        </section>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="h-16 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 font-black uppercase tracking-widest text-[11px] order-2 sm:order-1 flex-1 sm:flex-none sm:px-12"
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 order-1 sm:order-2 flex-1 sm:w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-3 size-5 animate-spin" />
              Đang lưu dữ liệu...
            </>
          ) : (
            <>
              {mode === 'create' ? 'Xác nhận Khởi tạo' : 'Cập nhật Thay đổi'} <ChevronRight className="ml-2 size-5" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
