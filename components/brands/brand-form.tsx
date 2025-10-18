"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target,
  Upload,
  Save,
  Lightbulb,
  Users,
  Loader2
} from "lucide-react";
import { User as UserType, Profile, Brand, CreateBrandForm as CreateBrandFormType } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useUserProfile, useProfiles } from "@/hooks/use-profile";
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
    profile_id: undefined,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [linkToProfile, setLinkToProfile] = useState<boolean>(false);

  // Hooks
  const { data: user } = useUserProfile();
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles();
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand(brand?.id || '');

  const loading = profilesLoading;

  useEffect(() => {
    // If edit mode, pre-fill form data
    if (mode === 'edit' && brand) {
      setFormData({
        name: brand.name,
        description: brand.description || '',
        slogan: brand.slogan || '',
        usp: brand.usp || '',
        target_audience: brand.target_audience || '',
        profile_id: brand.profile_id || undefined,
      });
      
      if (brand.logo_url) {
        setLogoPreview(brand.logo_url);
      }
      
      setLinkToProfile(!!brand.profile_id);
    }
  }, [mode, brand]);

  const handleInputChange = (field: keyof CreateBrandFormType, value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    // Validate profile selection if linking is enabled
    if (linkToProfile && !formData.profile_id) {
      toast.error('Vui lòng chọn profile để liên kết');
      return;
    }

    try {
      setSubmitting(true);
      
      if (mode === 'create') {
        await createBrandMutation.mutateAsync(formData);
      } else {
        await updateBrandMutation.mutateAsync(formData);
      }

      toast.success(`Brand ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      onSuccess?.();
    } catch (error) {
      console.error(`Failed to ${mode} brand:`, error);
      toast.error(`Failed to ${mode} brand`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your brand name"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="link-profile"
                  checked={linkToProfile}
                  onCheckedChange={(checked) => {
                    setLinkToProfile(checked as boolean);
                    if (!checked) {
                      handleInputChange('profile_id', undefined);
                    }
                  }}
                />
                <Label htmlFor="link-profile" className="text-sm font-medium">
                  Liên kết với profile cá nhân/doanh nghiệp của bạn?
                </Label>
              </div>

              {linkToProfile && (
                <div className="space-y-2 ml-6">
                  {profiles.length > 0 ? (
                    <>
                      <Label htmlFor="profile_id">Chọn Profile</Label>
                      <select
                        id="profile_id"
                        value={formData.profile_id || ''}
                        onChange={(e) => handleInputChange('profile_id', e.target.value === '' ? undefined : e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Chọn profile...</option>
                        {profiles.map((profile) => (
                          <option key={profile.id} value={profile.id}>
                            {profile.company_name || `${profile.profile_type} profile`}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                        Bạn chưa có profile nào. Hãy tạo profile trước khi liên kết với brand.
                      </p>
                      <Button asChild size="sm" variant="outline">
                        <a href="/dashboard/profile/create">
                          Tạo Profile
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Profile giúp định danh thương hiệu và tạo nội dung phù hợp hơn
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what your brand does and what makes it unique"
              rows={3}
            />
          </div>
        </div>

        {/* Brand Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Brand Identity</h3>
          </div>

          {/* Logo Upload */}
          <div className="space-y-3">
            <Label>Brand Logo</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {logoPreview ? (
                  <AvatarImage src={logoPreview} alt="Logo preview" />
                ) : (
                  <AvatarFallback>
                    <Target className="h-8 w-8" />
                  </AvatarFallback>
                )}
              </Avatar>

              <div>
                <input
                  type="file"
                  id="logo"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG up to 2MB
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slogan">Slogan</Label>
            <Input
              id="slogan"
              value={formData.slogan}
              onChange={(e) => handleInputChange('slogan', e.target.value)}
              placeholder="Your brand's tagline or slogan"
            />
          </div>
        </div>

        {/* Brand Strategy */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Brand Strategy</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usp">Unique Selling Proposition (USP)</Label>
            <Textarea
              id="usp"
              value={formData.usp}
              onChange={(e) => handleInputChange('usp', e.target.value)}
              placeholder="What makes your brand different from competitors? What unique value do you provide?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_audience">Target Audience</Label>
            <Textarea
              id="target_audience"
              value={formData.target_audience}
              onChange={(e) => handleInputChange('target_audience', e.target.value)}
              placeholder="Describe your ideal customers: demographics, interests, pain points, etc."
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating Brand...' : 'Updating Brand...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {mode === 'create' ? 'Create Brand' : 'Update Brand'}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}