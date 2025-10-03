"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Building2, 
  ArrowLeft,
  Upload,
  Save,
  CheckCircle
} from "lucide-react";
import { authApi, profileApi } from "@/lib/mock-api";
import { User as UserType, CreateProfileForm as CreateProfileFormType } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateProfileForm() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateProfileFormType>({
    profile_type: 'personal',
    company_name: '',
    bio: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleInputChange = (field: keyof CreateProfileFormType, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('User not found');
      return;
    }

    if (formData.profile_type === 'business' && !formData.company_name?.trim()) {
      toast.error('Company name is required for business profiles');
      return;
    }

    try {
      setSubmitting(true);
      const response = await profileApi.createProfile(user.id, formData);
      
      if (response.success) {
        toast.success('Profile created successfully!');
        router.push('/dashboard/profile');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to create profile:', error);
      toast.error('Failed to create profile');
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
          <h1 className="text-3xl font-bold tracking-tight">Create Profile</h1>
          <p className="text-muted-foreground">
            Set up your profile to get started with AISAM
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Choose whether this is a personal or business profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Type Selection */}
              <div className="space-y-3">
                <Label>Profile Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.profile_type === 'personal'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleInputChange('profile_type', 'personal')}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Personal</h3>
                        <p className="text-sm text-muted-foreground">
                          For individual creators and freelancers
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.profile_type === 'business'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleInputChange('profile_type', 'business')}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Business</h3>
                        <p className="text-sm text-muted-foreground">
                          For companies and organizations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Name (for business profiles) */}
              {formData.profile_type === 'business' && (
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Enter your company name"
                    required
                  />
                </div>
              )}

              {/* Avatar Upload */}
              <div className="space-y-3">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Profile preview" />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {formData.profile_type === 'business' 
                          ? formData.company_name?.[0] || 'B'
                          : user?.first_name?.[0] || 'U'
                        }
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div>
                    <input
                      type="file"
                      id="avatar"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('avatar')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder={
                    formData.profile_type === 'business'
                      ? "Tell us about your company, what you do, and your mission..."
                      : "Tell us about yourself, your interests, and what you do..."
                  }
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This will help AI generate better content for your brand
                </p>
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Profile
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
          </CardContent>
        </Card>

        {/* Help Text */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Why create a profile?</h3>
                <p className="text-sm text-muted-foreground">
                  Your profile helps AISAM understand your brand and generate more relevant content. 
                  You can always edit this information later in your profile settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
