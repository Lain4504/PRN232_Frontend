"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Save,
  X,
  Upload,
  CheckCircle
} from "lucide-react";
import { authApi, profileApi } from "@/lib/mock-api";
import { User as UserType, Profile } from "@/lib/types/aisam-types";
import { toast } from "sonner";

export function ProfileManagement() {
  const [user, setUser] = useState<UserType | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    profile_type: 'personal' as 'personal' | 'business',
    company_name: '',
    bio: '',
  });

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
          }
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      profile_type: profile.profile_type,
      company_name: profile.company_name || '',
      bio: profile.bio || '',
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editingProfile) return;

    try {
      const response = await profileApi.updateProfile(editingProfile.id, formData);
      if (response.success) {
        setProfiles(profiles.map(p => p.id === editingProfile.id ? response.data : p));
        setEditingProfile(null);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setEditingProfile(null);
    setIsEditing(false);
    setFormData({
      profile_type: 'personal',
      company_name: '',
      bio: '',
    });
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
          <p className="text-muted-foreground">
            Manage your personal information and business profiles
          </p>
        </div>
        {profiles.length === 0 && (
          <Button asChild>
            <a href="/dashboard/profile/create">
              <User className="mr-2 h-4 w-4" />
              Create Profile
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
            <CardDescription>
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {user?.first_name} {user?.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-1">
                  {user?.role}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              {user?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member since</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profiles */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Profiles
              </CardTitle>
              <CardDescription>
                Manage your business and personal profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profiles.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No profiles yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first profile to get started with AISAM
                  </p>
                  <Button asChild>
                    <a href="/dashboard/profile/create">
                      <User className="mr-2 h-4 w-4" />
                      Create Profile
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="border rounded-lg p-4">
                      {isEditing && editingProfile?.id === profile.id ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="profile_type">Profile Type</Label>
                              <select
                                id="profile_type"
                                value={formData.profile_type}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  profile_type: e.target.value as 'personal' | 'business'
                                })}
                                className="w-full p-2 border rounded-md"
                              >
                                <option value="personal">Personal</option>
                                <option value="business">Business</option>
                              </select>
                            </div>
                            
                            {formData.profile_type === 'business' && (
                              <div className="space-y-2">
                                <Label htmlFor="company_name">Company Name</Label>
                                <Input
                                  id="company_name"
                                  value={formData.company_name}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    company_name: e.target.value
                                  })}
                                  placeholder="Enter company name"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={formData.bio}
                              onChange={(e) => setFormData({
                                ...formData,
                                bio: e.target.value
                              })}
                              placeholder="Tell us about yourself or your business"
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button onClick={handleSaveProfile} size="sm">
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </Button>
                            <Button onClick={handleCancelEdit} variant="outline" size="sm">
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant={profile.profile_type === 'business' ? 'default' : 'secondary'}>
                                {profile.profile_type}
                              </Badge>
                              {profile.company_name && (
                                <h3 className="font-semibold">{profile.company_name}</h3>
                              )}
                            </div>
                            
                            {profile.bio && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {profile.bio}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Created: {new Date(profile.created_at).toLocaleDateString()}</span>
                              <span>Updated: {new Date(profile.updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleEditProfile(profile)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
