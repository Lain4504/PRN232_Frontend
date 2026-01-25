"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormField } from "@/components/ui/form-field";
import {
  Upload,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";
import { Brand, CreateBrandForm as CreateBrandFormType } from "@/lib/types/omniadly-types";
import { toast } from "sonner";
import { useCreateBrand, useUpdateBrand } from "@/hooks/use-brands";
import { useTranslation } from "react-i18next";

interface BrandFormProps {
  mode: 'create' | 'edit';
  brand?: Brand;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BrandForm({ mode, brand, onSuccess, onCancel }: BrandFormProps) {
  const { t } = useTranslation("common");
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingLogo = (brand as any).logo_url || (brand as any).logoUrl || null;
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
    if (!formData.name.trim()) return toast.error(t("brands.form.required"));

    try {
      setSubmitting(true);
      if (mode === 'create') await createBrandMutation.mutateAsync(formData);
      else await updateBrandMutation.mutateAsync(formData);
      toast.success(t("success"));
      onSuccess?.();
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-8 font-fira-sans">
      <div className="grid gap-8">
        {/* Core Identity Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b pb-3">
            <h3 className="font-bold text-lg text-foreground">{t("brands.form.identityCore")}</h3>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="relative shrink-0">
              <Avatar className="size-28 rounded-xl border bg-muted shadow-sm overflow-hidden cursor-pointer" onClick={() => document.getElementById('logo-upload')?.click()}>
                {logoPreview ? (
                  <AvatarImage src={logoPreview} className="object-cover" />
                ) : (
                  <AvatarFallback className="flex flex-col items-center justify-center gap-2">
                    <Upload className="size-6 text-muted-foreground/60" />
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">{t("brands.form.uploadLogo")}</span>
                  </AvatarFallback>
                )}
              </Avatar>
              <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} className="hidden" />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 size-8 rounded-lg shadow-md border"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <FormField label={t("brands.form.brandNameLabel")} required>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t("brands.form.namePlaceholder")}
                  className="h-10 font-semibold"
                />
              </FormField>
              <FormField label={t("brands.form.sloganLabel")}>
                <Input
                  value={formData.slogan}
                  onChange={(e) => handleInputChange('slogan', e.target.value)}
                  placeholder={t("brands.form.sloganPlaceholder")}
                  className="h-10 text-sm"
                />
              </FormField>
            </div>
          </div>
        </section>

        {/* Messaging Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b pb-3">
            <h3 className="font-bold text-lg text-foreground">{t("brands.form.strategicNarrative")}</h3>
          </div>

          <div className="grid gap-6">
            <FormField label={t("brands.form.descriptionLabel")}>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t("brands.form.descPlaceholder")}
                className="min-h-[100px] text-sm resize-none"
              />
            </FormField>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField label={t("brands.form.uspLabel")}>
                <Textarea
                  value={formData.usp}
                  onChange={(e) => handleInputChange('usp', e.target.value)}
                  placeholder={t("brands.form.uspPlaceholder")}
                  className="min-h-[120px] text-xs resize-none"
                />
              </FormField>

              <FormField label={t("brands.form.audienceLabel")}>
                <Textarea
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  placeholder={t("brands.form.audiencePlaceholder")}
                  className="min-h-[120px] text-xs resize-none"
                />
              </FormField>
            </div>
          </div>
        </section>
      </div>

      <div className="flex items-center gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 h-10 font-bold"
        >
          {t("brands.form.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="flex-[2] h-10 font-bold shadow-sm"
        >
          {submitting && <Loader2 className="size-4 animate-spin mr-2" />}
          {mode === 'create' ? t("brands.form.saveCreate") : t("brands.form.saveUpdate")}
        </Button>
      </div>
    </form>
  )
}
