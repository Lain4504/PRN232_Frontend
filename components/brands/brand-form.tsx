"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormField } from "@/components/ui/form-field";
import {
  Target,
  Upload,
  Save,
  Lightbulb,
  Plus,
  Loader2,
  Zap,
  Fingerprint,
  MessageSquareQuote
} from "lucide-react";
import { Brand, CreateBrandForm as CreateBrandFormType } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useCreateBrand, useUpdateBrand } from "@/hooks/use-brands";
import { cn } from "@/lib/utils";

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

      const existingLogo = (brand as unknown as Record<string, unknown>).logo_url || (brand as unknown as Record<string, unknown>).logoUrl || null;
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
    if (!formData.name.trim()) return toast.error('Brand Identity is required');

    try {
      setSubmitting(true);
      if (mode === 'create') await createBrandMutation.mutateAsync(formData);
      else await updateBrandMutation.mutateAsync(formData);
      toast.success(`Identity ${mode === 'create' ? 'initialized' : 'updated'} successfully`);
      onSuccess?.();
    } catch (error) {
      toast.error(`Protocol failed: Create ${mode} brand`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-10 font-fira-sans relative">
      {/* Visual Background Elements */}
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none -z-10">
        <Fingerprint className="size-60 text-primary rotate-12" />
      </div>

      <div className="grid gap-10">
        {/* Core Identity Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-border/40 pb-4">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
              <Fingerprint className="size-5" />
            </div>
            <div>
              <h3 className="font-black text-xl text-foreground uppercase tracking-tight italic">Identity Core</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Visual & Nominal Descriptors</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 bg-muted/5 p-6 rounded-3xl border border-dashed border-border/50">
            <div className="relative group shrink-0">
              <div className="absolute -inset-2 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
              <Avatar className="size-32 rounded-3xl border-4 border-background shadow-2xl overflow-hidden relative cursor-pointer group-hover:scale-105 transition-transform" onClick={() => document.getElementById('logo-upload')?.click()}>
                {logoPreview ? (
                  <AvatarImage src={logoPreview} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-muted/50 flex flex-col items-center justify-center gap-2 group-hover:bg-muted/80 transition-colors">
                    <Upload className="size-8 text-muted-foreground/60" />
                    <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Upload</span>
                  </AvatarFallback>
                )}
              </Avatar>
              <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} className="hidden" />
              <Button
                type="button"
                size="icon"
                className="absolute -bottom-3 -right-3 size-10 rounded-xl shadow-xl bg-primary hover:bg-primary/90 z-20"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Plus className="size-5" />
              </Button>
            </div>

            <div className="flex-1 space-y-5 w-full">
              <FormField label="Brand Designation (Name)" required>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="E.G. ACME CORP"
                  className="rounded-2xl h-14 font-black text-lg shadow-inner bg-background/50 border-input/60 focus-visible:ring-primary/20 placeholder:text-muted-foreground/30 uppercase italic"
                />
              </FormField>
              <FormField label="Primary Directive (Slogan)">
                <Input
                  value={formData.slogan}
                  onChange={(e) => handleInputChange('slogan', e.target.value)}
                  placeholder="YOUR CORE MISSION STATEMENT"
                  className="rounded-2xl h-12 font-bold shadow-inner bg-background/50 border-input/60 focus-visible:ring-primary/20 placeholder:text-muted-foreground/30 uppercase text-xs tracking-wide"
                />
              </FormField>
            </div>
          </div>
        </section>

        {/* Messaging Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-border/40 pb-4">
            <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
              <MessageSquareQuote className="size-5" />
            </div>
            <div>
              <h3 className="font-black text-xl text-foreground uppercase tracking-tight italic">Strategic Narrative</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Communication Protocols</p>
            </div>
          </div>

          <div className="grid gap-6">
            <FormField label="Identity Parameters (About)">
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Define the operational scope and personality matrix..."
                className="rounded-2xl min-h-[100px] font-medium resize-none shadow-inner bg-background/50 border-input/60 focus-visible:ring-primary/20 italic p-4 text-sm leading-relaxed"
              />
            </FormField>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField label="Unique Value (USP)">
                <Textarea
                  value={formData.usp}
                  onChange={(e) => handleInputChange('usp', e.target.value)}
                  placeholder="Key differentiation factors..."
                  className="rounded-2xl min-h-[120px] font-medium resize-none shadow-inner bg-background/50 border-input/60 focus-visible:ring-primary/20 text-xs leading-relaxed"
                />
              </FormField>

              <FormField label="Target Sector (Audience)">
                <Textarea
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  placeholder="Demographic and psychographic targets..."
                  className="rounded-2xl min-h-[120px] font-medium resize-none shadow-inner bg-background/50 border-input/60 focus-visible:ring-primary/20 text-xs leading-relaxed"
                />
              </FormField>
            </div>
          </div>
        </section>
      </div>

      <div className="flex items-center gap-4 pt-8 border-t border-dashed">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-xs border-2 hover:bg-muted"
        >
          Abort
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="flex-[2] rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.01]"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin mr-3" />
          ) : (
            <Zap className="size-4 mr-3 fill-current" />
          )}
          {mode === 'create' ? 'Initialize Identity' : 'Update Parameters'}
        </Button>
      </div>
    </form>
  )
}