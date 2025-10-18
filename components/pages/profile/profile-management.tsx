"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Save,
  X,
  Trash2,
  RotateCcw,
  Eye
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useGetProfiles, useGetProfile, useUpdateProfile, useDeleteProfile, useRestoreProfile } from "@/hooks/use-profiles";
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
  const [formData, setFormData] = useState({ profile_type: 'personal' as 'personal' | 'business', company_name: '', bio: '' })
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null)
  const updateMutation = useUpdateProfile(editingProfileId || "")
  const deleteMutation = useDeleteProfile()
  const restoreMutation = useRestoreProfile()

  const handleViewProfile = (profileId: string) => {
    setViewingProfileId(profileId)
  }

  const handleEditProfile = (profile: { id: string; profile_type: 'personal' | 'business'; company_name?: string; bio?: string }) => {
    setEditingProfileId(profile.id)
    setFormData({
      profile_type: profile.profile_type,
      company_name: profile.company_name || '',
      bio: profile.bio || '',
    })
  }

  const handleSaveProfile = async () => {
    if (!editingProfileId) return
    try {
      await updateMutation.mutateAsync({
        profile_type: formData.profile_type,
        company_name: formData.company_name,
        bio: formData.bio,
      })
      toast.success('Profile updated successfully')
      setEditingProfileId(null)
      refetch()
    } catch (e) {
      toast.error('Failed to update profile')
    }
  }

  const handleCancelEdit = () => {
    setEditingProfileId(null)
    setFormData({ profile_type: 'personal', company_name: '', bio: '' })
  }

  const handleCloseModal = () => {
    setViewingProfileId(null)
    setEditingProfileId(null)
    setFormData({ profile_type: 'personal', company_name: '', bio: '' })
  }

  const handleDeleteProfile = async (profileId: string) => {
    setDeleteProfileId(profileId)
  }

  const confirmDeleteProfile = async () => {
    if (!deleteProfileId) return
    try {
      await deleteMutation.mutateAsync(deleteProfileId)
      toast.success('Đã chuyển vào thùng rác')
      refetch()
    } catch (e) {
      toast.error('Xóa thất bại')
    } finally {
      setDeleteProfileId(null)
    }
  }

  const handleRestoreProfile = async (profileId: string) => {
    try {
      await restoreMutation.mutateAsync(profileId)
      toast.success('Khôi phục thành công')
      refetch()
    } catch (e) {
      toast.error('Khôi phục thất bại')
    }
  }

  if (isLoading) {
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
        <Button asChild>
          <Link href="/dashboard/profile/create">
            <User className="mr-2 h-4 w-4" />
            Create Profile
          </Link>
        </Button>
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
                  {userResult?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {userResult?.email}
                </h3>
                <p className="text-sm text-muted-foreground">Supabase User</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{userResult?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member since</p>
                  <p className="text-sm text-muted-foreground">
                    N/A
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
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Input
                  placeholder="Search profiles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant={showDeleted ? 'default' : 'outline'} onClick={() => setShowDeleted(v => !v)}>
                  {showDeleted ? 'Showing Deleted' : 'Active Only'}
                </Button>
              </div>
              {profiles.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No profiles yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first profile to get started with AISAM
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/profile/create">
                      <User className="mr-2 h-4 w-4" />
                      Create Profile
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="border rounded-lg p-4">
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
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleViewProfile(profile.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            onClick={() => handleEditProfile(profile)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          {!showDeleted ? (
                            <Button
                              onClick={() => handleDeleteProfile(profile.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleRestoreProfile(profile.id)}
                              variant="default"
                              size="sm"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Khôi phục
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile View/Edit Modal */}
      {(viewingProfileId || editingProfileId) && (
        isMobile ? (
          <Drawer open={!!(viewingProfileId || editingProfileId)} onOpenChange={handleCloseModal}>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>
                  {editingProfileId ? 'Edit Profile' : 'Profile Details'}
                </DrawerTitle>
                <DrawerDescription>
                  {editingProfileId ? 'Update your profile information' : 'View profile information'}
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-4 overflow-y-auto">
                {editingProfileId ? (
                  <EditProfileForm 
                    profileId={editingProfileId}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSaveProfile}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <ViewProfileContent profileId={viewingProfileId!} />
                )}
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={!!(viewingProfileId || editingProfileId)} onOpenChange={handleCloseModal}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProfileId ? 'Edit Profile' : 'Profile Details'}
                </DialogTitle>
                <DialogDescription>
                  {editingProfileId ? 'Update your profile information' : 'View profile information'}
                </DialogDescription>
              </DialogHeader>
              {editingProfileId ? (
                <EditProfileForm 
                  profileId={editingProfileId}
                  formData={formData}
                  setFormData={setFormData}
                  onSave={handleSaveProfile}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <ViewProfileContent profileId={viewingProfileId!} />
              )}
            </DialogContent>
          </Dialog>
        )
      )}

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteProfileId} onOpenChange={() => setDeleteProfileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa hồ sơ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hồ sơ này? Hành động này sẽ chuyển hồ sơ vào thùng rác và có thể khôi phục sau này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProfile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa hồ sơ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          {profileData.avatar_url ? (
            <AvatarImage src={profileData.avatar_url} alt="Avatar" />
          ) : (
            <AvatarFallback>{profileData.company_name?.[0] || 'P'}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="flex items-center gap-3">
            <Badge variant={profileData.profile_type === 'business' ? 'default' : 'secondary'}>
              {profileData.profile_type}
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
          <span className="font-medium text-foreground">Created:</span> {new Date(profileData.created_at).toLocaleString()}
        </div>
        <div>
          <span className="font-medium text-foreground">Updated:</span> {new Date(profileData.updated_at).toLocaleString()}
        </div>
      </div>
    </div>
  )
}

// Edit Profile Form Component
function EditProfileForm({ 
  profileId, 
  formData, 
  setFormData, 
  onSave, 
  onCancel 
}: { 
  profileId: string
  formData: { profile_type: 'personal' | 'business', company_name: string, bio: string }
  setFormData: (data: { profile_type: 'personal' | 'business', company_name: string, bio: string }) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-6">
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
            onClick={() => setFormData({
              ...formData,
              profile_type: 'personal',
              company_name: formData.profile_type === 'business' ? '' : formData.company_name
            })}
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
            onClick={() => setFormData({
              ...formData,
              profile_type: 'business'
            })}
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
            onChange={(e) => setFormData({
              ...formData,
              company_name: e.target.value
            })}
            placeholder="Enter your company name"
            required
          />
        </div>
      )}

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
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
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          This will help AI generate better content for your brand
        </p>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button onClick={onSave} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
        <Button onClick={onCancel} variant="outline">
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
