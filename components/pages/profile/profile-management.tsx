"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { FormField } from "@/components/ui/form-field";
import { 
  User, 
  Building2, 
  Edit,
  Save,
  X,
  Trash2,
  RotateCcw,
  Eye,
  Plus,
  Search,
  AlertCircle,
  Users
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useGetProfiles, useGetProfile, useCreateProfile, useUpdateProfile, useDeleteProfile, useRestoreProfile } from "@/hooks/use-profiles";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


export function ProfileManagement() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [search, setSearch] = useState("")
  const [showDeleted, setShowDeleted] = useState(false)
  const isMobile = useIsMobile()
  const { data: userResult } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
  })
  const userId = userResult?.id || ""
  const { data: profiles = [], isLoading, refetch } = useGetProfiles(userId, search || undefined, showDeleted)
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null)
  const [creatingProfile, setCreatingProfile] = useState(false)
  const [formData, setFormData] = useState({ 
    profile_type: 'personal' as 'personal' | 'business', 
    company_name: '', 
    bio: '',
    avatar: null as File | null,
    avatarUrl: ''
  })
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null)
  const createProfileMutation = useCreateProfile(userId)
  const updateMutation = useUpdateProfile(editingProfileId || "")
  const deleteMutation = useDeleteProfile()
  const restoreMutation = useRestoreProfile()


  const handleViewProfile = (profileId: string) => {
    setViewingProfileId(profileId)
  }

  const handleCreateProfile = () => {
    setCreatingProfile(true)
    setFormData({ 
      profile_type: 'personal', 
      company_name: '', 
      bio: '',
      avatar: null,
      avatarUrl: ''
    })
  }

  const handleEditProfile = (profile: { id: string; profileType: number; company_name?: string; bio?: string; avatarUrl?: string }) => {
    setEditingProfileId(profile.id)
    const profileType = profile.profileType === 0 ? 'personal' : 'business';
    setFormData({
      profile_type: profileType,
      company_name: profile.company_name || '',
      bio: profile.bio || '',
      avatar: null,
      avatarUrl: profile.avatarUrl || ''
    })
  }

  const handleSaveProfile = async () => {
    try {
      if (creatingProfile) {
        await createProfileMutation.mutateAsync({
          profile_type: formData.profile_type,
          company_name: formData.company_name,
          bio: formData.bio,
          avatar: formData.avatar || undefined,
          avatarUrl: formData.avatarUrl,
        })
        toast.success('Profile created successfully')
        setCreatingProfile(false)
      } else if (editingProfileId) {
        await updateMutation.mutateAsync({
          profile_type: formData.profile_type,
          company_name: formData.company_name,
          bio: formData.bio,
          avatar: formData.avatar || undefined,
          avatarUrl: formData.avatarUrl,
        })
        toast.success('Profile updated successfully')
        setEditingProfileId(null)
      }
      refetch()
    } catch (e) {
      toast.error(creatingProfile ? 'Failed to create profile' : 'Failed to update profile')
    }
  }

  const handleCancelEdit = () => {
    setEditingProfileId(null)
    setCreatingProfile(false)
    setFormData({ profile_type: 'personal', company_name: '', bio: '', avatar: null, avatarUrl: '' })
  }

  const handleCloseModal = () => {
    setViewingProfileId(null)
    setEditingProfileId(null)
    setCreatingProfile(false)
    setFormData({ profile_type: 'personal', company_name: '', bio: '', avatar: null, avatarUrl: '' })
  }

  const handleDeleteProfile = async (profileId: string) => {
    setDeleteProfileId(profileId)
  }

  const confirmDeleteProfile = async () => {
    if (!deleteProfileId) return
    try {
      await deleteMutation.mutateAsync(deleteProfileId)
      toast.success('Profile moved to trash')
      refetch()
    } catch (e) {
      toast.error('Failed to delete profile')
    } finally {
      setDeleteProfileId(null)
    }
  }

  const handleRestoreProfile = async (profileId: string) => {
    try {
      await restoreMutation.mutateAsync(profileId)
      toast.success('Profile restored successfully')
      refetch()
    } catch (e) {
      toast.error('Failed to restore profile')
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Skeleton className="h-10 w-64 mb-3" />
                <Skeleton className="h-5 w-80" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalProfiles = profiles.length;
  const businessProfiles = profiles.filter(p => p.profileType === 1).length;
  const personalProfiles = profiles.filter(p => p.profileType === 0).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        {/* Header */}
        <div className="space-y-3 lg:space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
              Profile Management
            </h1>
            <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
              Manage your business and personal profiles to customize your content and branding
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <Users className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{totalProfiles}</span>
              <span className="text-muted-foreground">Total</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <Building2 className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{businessProfiles}</span>
              <span className="text-muted-foreground">Business</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <User className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{personalProfiles}</span>
              <span className="text-muted-foreground">Personal</span>
            </div>
          </div>
        </div>

        {/* Create New Profile */}
        <Card className="border border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Create New Profile</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Create a new business or personal profile to customize your content and branding.
            </p>
            <Button size="sm" onClick={handleCreateProfile} className="w-full sm:w-auto h-8 text-xs">
              <Plus className="mr-1 h-3 w-3" />
              Create Profile
            </Button>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search profiles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <Button 
            variant={showDeleted ? 'default' : 'outline'} 
            onClick={() => setShowDeleted(v => !v)}
            size="sm"
            className="h-9"
          >
            {showDeleted ? 'Showing Deleted' : 'Active Only'}
          </Button>
        </div>

        {/* Profiles List */}
        {profiles.length > 0 ? (
          <div className="space-y-3 lg:space-y-4">
            <h2 className="text-lg lg:text-xl font-semibold">Your Profiles</h2>
            <div className="space-y-3">
              {profiles.map((profile) => {
                const profileType = profile.profileType === 0 ? 'personal' : 'business';
                
                return (
                  <Card key={profile.id} className="border border-border/50 hover:border-border transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          {profile.avatarUrl ? (
                            <AvatarImage src={profile.avatarUrl} alt="Profile Avatar" />
                          ) : (
                            <AvatarFallback className="text-sm">
                              {profileType === 'business' && profile.company_name 
                                ? profile.company_name[0]?.toUpperCase() 
                                : 'P'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant={profileType === 'business' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {profileType}
                            </Badge>
                            {profileType === 'business' && profile.company_name && (
                              <h3 className="font-semibold text-sm lg:text-base truncate">
                                {profile.company_name}
                              </h3>
                            )}
                          </div>
                          
                          {profile.bio && (
                            <p className="text-xs lg:text-sm text-muted-foreground mb-3 line-clamp-2">
                              {profile.bio}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Created: {new Date(profile.createdAt).toLocaleDateString()}</span>
                            <span>Updated: {new Date(profile.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleViewProfile(profile.id)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => handleEditProfile(profile)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {!showDeleted ? (
                          <Button
                            onClick={() => handleDeleteProfile(profile.id)}
                            variant="destructive"
                            size="sm"
                            className="h-8 px-2 text-xs"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleRestoreProfile(profile.id)}
                            variant="default"
                            size="sm"
                            className="h-8 px-2 text-xs"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <Card className="border border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No profiles yet</h3>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-sm mx-auto">
                Create your first profile to get started with AISAM
              </p>
              <Button onClick={handleCreateProfile} size="sm" className="h-8 text-xs">
                <User className="mr-1 h-3 w-3" />
                Create Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="border border-blue-200 dark:border-blue-800">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-xs mb-1">
                  About Profile Management
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  Profiles help AISAM understand your brand and generate more relevant content. 
                  You can create separate profiles for different businesses or personal use cases.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile View/Edit/Create Modal */}
        {(viewingProfileId || editingProfileId || creatingProfile) && (
          isMobile ? (
            <Drawer open={!!(viewingProfileId || editingProfileId || creatingProfile)} onOpenChange={handleCloseModal}>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="pb-3">
                  <DrawerTitle className="text-lg">
                    {creatingProfile ? 'Create Profile' : editingProfileId ? 'Edit Profile' : 'Profile Details'}
                  </DrawerTitle>
                  <DrawerDescription className="text-sm">
                    {creatingProfile ? 'Create a new profile for your business or personal use' : editingProfileId ? 'Update your profile information' : 'View profile information'}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-4 overflow-y-auto flex-1">
                  {(editingProfileId || creatingProfile) ? (
                    <EditProfileForm 
                      profileId={editingProfileId || ''}
                      formData={formData}
                      setFormData={setFormData}
                      onSave={handleSaveProfile}
                      onCancel={handleCancelEdit}
                      mode={creatingProfile ? 'create' : 'edit'}
                    />
                  ) : (
                    <ViewProfileContent profileId={viewingProfileId!} />
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={!!(viewingProfileId || editingProfileId || creatingProfile)} onOpenChange={handleCloseModal}>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-xl">
                    {creatingProfile ? 'Create Profile' : editingProfileId ? 'Edit Profile' : 'Profile Details'}
                  </DialogTitle>
                  <DialogDescription>
                    {creatingProfile ? 'Create a new profile for your business or personal use' : editingProfileId ? 'Update your profile information' : 'View profile information'}
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1">
                  {(editingProfileId || creatingProfile) ? (
                    <EditProfileForm 
                      profileId={editingProfileId || ''}
                      formData={formData}
                      setFormData={setFormData}
                      onSave={handleSaveProfile}
                      onCancel={handleCancelEdit}
                      mode={creatingProfile ? 'create' : 'edit'}
                    />
                  ) : (
                    <ViewProfileContent profileId={viewingProfileId!} />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )
        )}

        {/* Delete Confirmation Modal */}
        <AlertDialog open={!!deleteProfileId} onOpenChange={() => setDeleteProfileId(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg">Confirm Profile Deletion</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Are you sure you want to delete this profile? This action will move the profile to trash and can be restored later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteProfile} 
                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Profile
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// View Profile Component
function ViewProfileContent({ profileId }: { profileId: string }) {
  const { data: profile, isLoading, error } = useGetProfile(profileId)
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {error ? 'Có lỗi xảy ra khi tải hồ sơ' : 'Không tìm thấy hồ sơ'}
      </div>
    )
  }

  const profileData = profile
  const profileType = profileData.profileType === 0 ? 'personal' : 'business'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          {profileData.avatarUrl ? (
            <AvatarImage src={profileData.avatarUrl} alt="Avatar" />
          ) : (
            <AvatarFallback>{profileData.company_name?.[0] || 'P'}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="flex items-center gap-3">
            <Badge variant={profileType === 'business' ? 'default' : 'secondary'}>
              {profileType}
            </Badge>
            {profileData.company_name && (
              <h3 className="font-semibold text-lg">{profileData.company_name}</h3>
            )}
          </div>
          {profileData.bio && (
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{profileData.bio}</p>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
        <div>
          <span className="font-medium text-foreground">Created:</span> {new Date(profileData.createdAt).toLocaleString()}
        </div>
        <div>
          <span className="font-medium text-foreground">Updated:</span> {new Date(profileData.updatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  )
}

// Avatar Preview Component
function AvatarPreview({ 
  avatar, 
  avatarUrl, 
  profileType 
}: { 
  avatar: File | null
  avatarUrl: string
  profileType: 'personal' | 'business'
}) {
  const avatarSrc = useMemo(() => {
    if (avatar) {
      return URL.createObjectURL(avatar)
    }
    return avatarUrl || ''
  }, [avatar, avatarUrl])

  return (
    <Avatar className="h-16 w-16">
      <AvatarImage src={avatarSrc} alt="Profile avatar" />
      <AvatarFallback>
        {profileType === 'business' ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
      </AvatarFallback>
    </Avatar>
  )
}

// Edit Profile Form Component
function EditProfileForm({ 
  profileId, 
  formData, 
  setFormData, 
  onSave, 
  onCancel,
  mode = 'edit'
}: { 
  profileId: string
  formData: { profile_type: 'personal' | 'business', company_name: string, bio: string, avatar: File | null, avatarUrl: string }
  setFormData: (data: { profile_type: 'personal' | 'business', company_name: string, bio: string, avatar: File | null, avatarUrl: string }) => void
  onSave: () => void
  onCancel: () => void
  mode?: 'create' | 'edit'
}) {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Profile Type Selection */}
      <FormField label="Profile Type" required>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
          <div
            className={`p-3 lg:p-4 border rounded-lg cursor-pointer transition-colors ${
              formData.profile_type === 'personal'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setFormData({
              ...formData,
              profile_type: 'personal',
              company_name: formData.profile_type === 'business' ? '' : formData.company_name
            })}
          >
            <div className="flex items-center gap-2 lg:gap-3">
              <User className="h-4 w-4 lg:h-5 lg:w-5 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-medium text-sm lg:text-base">Personal</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  For individual creators and freelancers
                </p>
              </div>
            </div>
          </div>
          
          <div
            className={`p-3 lg:p-4 border rounded-lg cursor-pointer transition-colors ${
              formData.profile_type === 'business'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setFormData({
              ...formData,
              profile_type: 'business'
            })}
          >
            <div className="flex items-center gap-2 lg:gap-3">
              <Building2 className="h-4 w-4 lg:h-5 lg:w-5 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-medium text-sm lg:text-base">Business</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  For companies and organizations
                </p>
              </div>
            </div>
          </div>
        </div>
      </FormField>

      {/* Avatar Upload */}
      <FormField label="Avatar" description="Upload a profile picture or enter an image URL">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <AvatarPreview 
              avatar={formData.avatar}
              avatarUrl={formData.avatarUrl}
              profileType={formData.profile_type}
            />
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, avatar: file });
                }}
                className="mb-2"
              />
              <div className="text-xs text-muted-foreground">Or enter image URL:</div>
              <Input
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </FormField>

      {/* Company Name (for business profiles) */}
      {formData.profile_type === 'business' && (
        <FormField label="Company Name" required>
          <Input
            value={formData.company_name}
            onChange={(e) => setFormData({
              ...formData,
              company_name: e.target.value
            })}
            placeholder="Enter your company name"
            required
            className="h-9 lg:h-10"
          />
        </FormField>
      )}

      {/* Bio */}
      <FormField 
        label="Bio" 
        description="This will help AI generate better content for your brand"
      >
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData({
            ...formData,
            bio: e.target.value
          })}
          placeholder={
            formData.profile_type === 'business'
              ? "Tell us about your company, what you do, and your mission..."
              : "Tell us about yourself, your interests, and what you do..."
          }
          rows={3}
          className="resize-none"
        />
        <div className="text-xs text-muted-foreground mt-1">
          {formData.bio.length}/500 characters
        </div>
      </FormField>
      
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button onClick={onSave} className="flex-1 h-9 lg:h-10">
          <Save className="mr-2 h-4 w-4" />
          {mode === 'create' ? 'Create Profile' : 'Save Changes'}
        </Button>
        <Button onClick={onCancel} variant="outline" className="h-9 lg:h-10">
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  )
}

