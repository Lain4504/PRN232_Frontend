"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Target, 
  ArrowLeft,
  Upload,
  Save,
  CheckCircle,
  Building2,
  Lightbulb,
  Users
} from "lucide-react";
import { authApi, brandApi, profileApi } from "@/lib/mock-api";
import { User as UserType, Profile, CreateBrandForm as CreateBrandFormType } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateBrandForm() {
  const [user, setUser] = useState<UserType | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateBrandFormType>({
    name: '',
    description: '',
    slogan: '',
    usp: '',
    target_audience: '',
    profile_id: undefined, // Made optional
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [linkToProfile, setLinkToProfile] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
          
          // Get user's profiles
          const profilesResponse = await profileApi.getProfiles(userResponse.data.id);
          if (profilesResponse.success) {
            setProfiles(profilesResponse.data);
            // Set default profile if only one exists
            if (profilesResponse.data.length === 1) {
              setFormData(prev => ({
                ...prev,
                profile_id: profilesResponse.data[0].id
              }));
            }
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
      const response = await brandApi.createBrand(formData);
      
      if (response.success) {
        toast.success('Brand created successfully!');
        router.push('/dashboard/brands');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to create brand:', error);
      toast.error('Failed to create brand');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Profiles are optional, so we don't block brand creation

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Brand</h1>
          <p className="text-muted-foreground">
            Set up a new brand for your business
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Tell us about your brand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>

          {/* Brand Identity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Brand Identity
              </CardTitle>
              <CardDescription>
                Define your brand&apos;s voice and visual identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      Upload Logo
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
            </CardContent>
          </Card>

          {/* Brand Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Brand Strategy
              </CardTitle>
              <CardDescription>
                Define your unique value proposition and target audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Creating Brand...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Brand
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-chart-2 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Why define your brand?</h3>
                <p className="text-sm text-muted-foreground">
                  A well-defined brand helps AISAM generate more relevant and consistent content. 
                  The more details you provide, the better our AI can understand your brand voice and create content that resonates with your audience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
