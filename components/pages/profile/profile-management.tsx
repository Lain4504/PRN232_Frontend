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
import { useAuth } from "@/lib/contexts/auth-context";
import { useGetProfiles, useGetProfile, useCreateProfile, useUpdateProfile, useDeleteProfile, useRestoreProfile } from "@/hooks/use-profiles";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProfileTypeEnum } from "@/lib/utils/profile-utils";
import { Profile } from "@/lib/types/omniadly-types";
import { cn } from "@/lib/utils";


export function ProfileManagement() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [showDeleted, setShowDeleted] = useState(false)
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const userId = user?.id || ""
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

  const handleEditProfile = (profile: Profile) => {
    setEditingProfileId(profile.id)
    const profileType = profile.profileType === ProfileTypeEnum.Free ? 'personal' : 'business';
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
          name: formData.company_name || 'Personal Profile',
          profile_type: formData.profile_type === 'business' ? 'Pro' : 'Free',
          company_name: formData.company_name,
          bio: formData.bio,
          avatar: formData.avatar || undefined,
          avatarUrl: formData.avatarUrl,
        })
        toast.success('Identity node initialized')
        setCreatingProfile(false)
      } else if (editingProfileId) {
        await updateMutation.mutateAsync({
          profile_type: formData.profile_type === 'business' ? 'Pro' : 'Free',
          company_name: formData.company_name,
          bio: formData.bio,
          avatar: formData.avatar || undefined,
          avatarUrl: formData.avatarUrl,
        })
        toast.success('Identity metadata synchronized')
        setEditingProfileId(null)
      }
      refetch()
    } catch (e) {
      toast.error(creatingProfile ? 'Failed to initialize node' : 'Failed to synchronize metadata')
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
      toast.success('Identity moved to termination queue')
      refetch()
    } catch (e) {
      toast.error('Termination failed')
    } finally {
      setDeleteProfileId(null)
    }
  }

  const handleRestoreProfile = async (profileId: string) => {
    try {
      await restoreMutation.mutateAsync(profileId)
      toast.success('Identity node reactivated')
      refetch()
    } catch (e) {
      toast.error('Reactivation failed')
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="space-y-10 p-6 lg:p-10 bg-background">
          <Skeleton className="h-4 w-48" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-6 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalProfiles = profiles.length;
  const businessProfiles = profiles.filter(p => p.profileType === ProfileTypeEnum.Pro || p.profileType === ProfileTypeEnum.Basic).length;
  const personalProfiles = profiles.filter(p => p.profileType === ProfileTypeEnum.Free).length;

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="space-y-10 p-6 lg:p-10 bg-background">

        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded bg-muted flex items-center justify-center text-muted-foreground">
                <User className="size-3.5" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">Cổng quản lý định danh</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
              Quản lý <span className="text-primary">Hồ sơ</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Cấu hình và điều phối các hồ sơ định danh đa miền của bạn. Đồng bộ metadata để tối ưu hóa việc tạo nội dung AI.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-5 py-3 bg-card rounded-lg border border-border shadow-sm flex items-center gap-6">
              <div className="space-y-0.5">
                <div className="text-[10px] font-semibold text-muted-foreground">Hồ sơ đang chạy</div>
                <div className="text-xl font-bold text-foreground">{totalProfiles}</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="space-y-0.5">
                <div className="text-[10px] font-semibold text-primary">Bảo mật</div>
                <div className="text-xl font-bold text-primary">Đã xác minh</div>
              </div>
            </div>
          </div>
        </div>

        {/* Command Matrix Grid */}
        <div className="grid lg:grid-cols-12 gap-10">

          {/* Left Sidebar - Quick Actions & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden group">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Plus className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Khởi tạo hồ sơ</h3>
                </div>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Bắt đầu tạo một hồ sơ định danh mới để mở rộng hướng sáng tạo hoặc quản lý tài sản tổ chức riêng biệt.
                </p>
                <Button onClick={handleCreateProfile} className="w-full h-12 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo hồ sơ mới
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-muted/30 border border-border rounded-lg space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground">Doanh nghiệp</p>
                <p className="text-2xl font-bold text-foreground">{businessProfiles}</p>
              </div>
              <div className="p-6 bg-muted/30 border border-border rounded-lg space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground">Cá nhân</p>
                <p className="text-2xl font-bold text-foreground">{personalProfiles}</p>
              </div>
            </div>

            <Card className="bg-primary p-8 rounded-lg text-primary-foreground border-none shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Users className="size-24" />
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3">
                  <AlertCircle className="size-5" />
                  <h4 className="font-bold text-lg">Giao thức định danh</h4>
                </div>
                <p className="text-sm font-medium leading-relaxed opacity-90">
                  Hồ sơ của bạn là nền tảng neural để AI tạo nội dung. Metadata chất lượng cao sẽ giúp AI hiểu thương hiệu tốt hơn.
                </p>
              </div>
            </Card>
          </div>

          {/* Right Main - Directory */}
          <div className="lg:col-span-8 space-y-8">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm hồ sơ định danh..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 bg-card border-border rounded-md font-medium text-sm focus-visible:ring-primary/20"
                />
              </div>
              <Button
                variant={showDeleted ? 'default' : 'outline'}
                onClick={() => setShowDeleted(v => !v)}
                className="h-12 px-6 rounded-md border-border font-semibold text-sm transition-all"
              >
                {showDeleted ? 'Hồ sơ đã lưu trữ' : 'Hồ sơ đang hoạt động'}
              </Button>
            </div>

            {/* Identity Matrix */}
            {profiles.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {profiles.map((profile) => {
                  const profileType = profile.profileType === ProfileTypeEnum.Free ? 'personal' : 'business';
                  return (
                    <Card key={profile.id} className="group relative bg-card border-border hover:border-primary/50 rounded-lg transition-all duration-300 shadow-sm overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                          <div className="relative size-20 rounded-md overflow-hidden border border-border bg-muted/30 group-hover:scale-105 transition-transform duration-500 shrink-0">
                            {profile.avatarUrl ? (
                              <AvatarImage src={profile.avatarUrl} alt="" className="object-cover h-full w-full" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center font-bold text-xl text-muted-foreground">
                                {profile.company_name?.[0].toUpperCase() || 'P'}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-4 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <Badge variant="secondary" className={cn(
                                "h-5 px-2 rounded-sm font-semibold text-[10px] justify-center sm:justify-start",
                                profileType === 'business' ? 'bg-primary/10 text-primary border-none' : 'bg-muted text-muted-foreground border-none'
                              )}>
                                {profileType === 'business' ? 'DOANH NGHIỆP' : 'CÁ NHÂN'}
                              </Badge>
                              <h3 className="text-lg font-bold text-foreground truncate">
                                {profile.company_name || 'Hồ sơ cá nhân'}
                              </h3>
                            </div>

                            {profile.bio && (
                              <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed">
                                {profile.bio}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-1">
                              <div className="space-y-0.5">
                                <p className="text-[10px] font-semibold text-muted-foreground">Ngày khởi tạo</p>
                                <p className="text-xs font-bold text-foreground">
                                  {new Date(profile.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="h-6 w-px bg-border/20 hidden sm:block" />
                              <div className="space-y-0.5">
                                <p className="text-[10px] font-semibold text-muted-foreground">Trạng thái</p>
                                <p className="text-xs font-bold text-emerald-500">Đang hoạt động</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-2 shrink-0">
                            <Button onClick={() => handleViewProfile(profile.id)} variant="outline" size="icon" className="size-10 rounded-md border-border hover:bg-muted text-muted-foreground">
                              <Eye className="size-4" />
                            </Button>
                            <Button onClick={() => handleEditProfile(profile)} variant="outline" size="icon" className="size-10 rounded-md border-border hover:bg-muted text-muted-foreground">
                              <Edit className="size-4" />
                            </Button>
                            {!showDeleted ? (
                              <Button onClick={() => handleDeleteProfile(profile.id)} variant="outline" size="icon" className="size-10 rounded-md border-border hover:bg-destructive/10 text-destructive">
                                <Trash2 className="size-4" />
                              </Button>
                            ) : (
                              <Button onClick={() => handleRestoreProfile(profile.id)} variant="outline" size="icon" className="size-10 rounded-md border-border hover:bg-emerald-500/10 text-emerald-500">
                                <RotateCcw className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed border-border rounded-lg bg-muted/30">
                <div className="size-16 rounded-md bg-card flex items-center justify-center mb-6 shadow-sm border border-border">
                  <Building2 className="size-8 text-muted-foreground/30" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Danh sách trống</h3>
                  <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed text-sm italic">
                    Không tìm thấy hồ sơ nào trong phân vùng này. Hãy khởi tạo hồ sơ đầu tiên để bắt đầu.
                  </p>
                </div>
                <Button onClick={handleCreateProfile} className="mt-8 h-10 px-8 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  Khởi tạo ngay
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tactical Interaction Portals (Modals) */}
        {(viewingProfileId || editingProfileId || creatingProfile) && (
          isMobile ? (
            <Drawer open={!!(viewingProfileId || editingProfileId || creatingProfile)} onOpenChange={handleCloseModal}>
              <DrawerContent className="max-h-[85vh] border-t-border bg-popover p-6">
                <DrawerHeader className="px-0 pb-8 space-y-2">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    {creatingProfile ? 'Khởi tạo hồ sơ' : editingProfileId ? 'Chỉnh sửa hồ sơ' : 'Chi tiết hồ sơ'}
                  </DrawerTitle>
                  <DrawerDescription className="text-sm font-medium text-muted-foreground">
                    {creatingProfile ? 'Thiết lập thông số cho hồ sơ định danh mới.' : editingProfileId ? 'Cập nhật thông tin cho hồ sơ.' : 'Thông tin chi tiết về hồ sơ định danh.'}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="overflow-y-auto pb-8">
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
              <DialogContent className="max-w-xl rounded-lg border-border bg-popover p-0 shadow-lg overflow-hidden">
                <DialogHeader className="p-8 border-b">
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    {creatingProfile ? 'Khởi tạo hồ sơ' : editingProfileId ? 'Chỉnh sửa hồ sơ' : 'Chi tiết hồ sơ'}
                  </DialogTitle>
                  <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">
                    {creatingProfile ? 'Thiết lập các thông số cơ bản cho hồ sơ định danh mới.' : editingProfileId ? 'Cập nhật metadata và thông tin nhận diện cho hồ sơ.' : 'Thông tin chi tiết về hồ sơ định danh và lịch sử hoạt động.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="p-8 overflow-y-auto max-h-[70vh]">
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

        {/* Global Termination Portal */}
        <AlertDialog open={!!deleteProfileId} onOpenChange={() => setDeleteProfileId(null)}>
          <AlertDialogContent className="max-w-md rounded-lg border-border bg-popover p-8 shadow-lg">
            <AlertDialogHeader className="space-y-4">
              <AlertDialogTitle className="text-xl font-bold text-foreground">Xác nhận xóa hồ sơ?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
                Hồ sơ này sẽ được chuyển vào <span className="text-destructive font-bold">Lưu trữ</span>. Bạn có thể khôi phục lại sau nếu cần thiết.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 flex items-center justify-end gap-3">
              <AlertDialogCancel className="rounded-md h-10 font-semibold text-sm">Hủy bỏ</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProfile}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md h-10 font-semibold text-sm border-none shadow-sm"
              >
                Xác nhận xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function ViewProfileContent({ profileId }: { profileId: string }) {
  const { data: profile, isLoading, error } = useGetProfile(profileId)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse text-sm">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
        Đang giải mã ma trận hồ sơ...
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20 space-y-4">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
        <p className="font-bold text-muted-foreground">KHÔNG TÌM THẤY DỮ LIỆU HỒ SƠ</p>
      </div>
    )
  }

  const profileData = profile
  const profileType = profileData.profileType === ProfileTypeEnum.Free ? 'personal' : 'business'

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        <div className="relative size-24 rounded-lg overflow-hidden border border-border bg-muted/30 shrink-0">
          {profileData.avatarUrl ? (
            <AvatarImage src={profileData.avatarUrl} alt="Avatar" className="object-cover h-full w-full" />
          ) : (
            <div className="h-full w-full flex items-center justify-center font-bold text-3xl text-muted-foreground">
              {profileData.company_name?.[0] || 'P'}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Badge variant="secondary" className={cn(
              "h-6 px-3 rounded-md font-semibold text-[10px]",
              profileType === 'business' ? 'bg-primary/10 text-primary border-none' : 'bg-muted text-muted-foreground border-none'
            )}>
              {profileType === 'business' ? 'DOANH NGHIỆP' : 'CÁ NHÂN'}
            </Badge>
            {profileData.company_name && (
              <h3 className="font-bold text-2xl text-foreground">{profileData.company_name}</h3>
            )}
          </div>
          {profileData.bio && (
            <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-xl">
              {profileData.bio}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground">Thời gian khởi tạo</p>
          <p className="text-sm font-bold text-foreground">
            {new Date(profileData.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground">Lần cập nhật cuối</p>
          <p className="text-sm font-bold text-foreground">
            {new Date(profileData.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

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
    <div className="relative size-20 rounded-lg overflow-hidden border border-border bg-card cursor-pointer group hover:scale-105 transition-transform duration-500">
      <Avatar className="h-full w-full rounded-none">
        <AvatarImage src={avatarSrc} alt="" className="object-cover h-full w-full" />
        <AvatarFallback className="bg-muted text-muted-foreground rounded-none">
          {profileType === 'business' ? <Building2 className="size-8" /> : <User className="size-8" />}
        </AvatarFallback>
      </Avatar>
      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Plus className="size-6 text-white" />
      </div>
    </div>
  )
}

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
    <div className="space-y-10">
      <FormField label="Loại hình hồ sơ" required>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div
            className={`p-6 border rounded-lg cursor-pointer transition-all duration-300 group ${formData.profile_type === 'personal'
              ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
              : 'border-border bg-card hover:border-primary/50'
              }`}
            onClick={() => setFormData({
              ...formData,
              profile_type: 'personal',
              company_name: formData.profile_type === 'business' ? '' : formData.company_name
            })}
          >
            <div className="flex items-center gap-4">
              <div className={`size-12 rounded-lg flex items-center justify-center transition-all ${formData.profile_type === 'personal' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <User className="size-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-foreground">Cá nhân</h3>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                  Cá nhân / Tự do
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 border rounded-lg cursor-pointer transition-all duration-300 group ${formData.profile_type === 'business'
              ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
              : 'border-border bg-card hover:border-primary/50'
              }`}
            onClick={() => setFormData({
              ...formData,
              profile_type: 'business'
            })}
          >
            <div className="flex items-center gap-4">
              <div className={`size-12 rounded-lg flex items-center justify-center transition-all ${formData.profile_type === 'business' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Building2 className="size-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-foreground">Doanh nghiệp</h3>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                  Tổ chức / Công ty
                </p>
              </div>
            </div>
          </div>
        </div>
      </FormField>

      <FormField label="Ảnh đại diện" description="Hình ảnh nhận diện chính cho hồ sơ công việc.">
        <div className="flex items-center gap-6 pt-2">
          <AvatarPreview
            avatar={formData.avatar}
            avatarUrl={formData.avatarUrl}
            profileType={formData.profile_type}
          />
          <div className="flex-1 space-y-4">
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, avatar: file });
                }}
                className="bg-muted/30 border-border hover:border-primary/50 transition-all rounded-md h-10 pt-1.5 text-xs font-medium cursor-pointer"
              />
            </div>
            <div className="relative">
              <Input
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="bg-muted/30 border-border hover:border-primary/50 transition-all rounded-md h-10 font-medium text-xs tracking-tight"
              />
            </div>
          </div>
        </div>
      </FormField>

      {formData.profile_type === 'business' && (
        <FormField label="Tên tổ chức/công ty" required>
          <Input
            value={formData.company_name}
            onChange={(e) => setFormData({
              ...formData,
              company_name: e.target.value
            })}
            placeholder="TÊN PHÁP NHÂN CỦA BẠN"
            required
            className="bg-muted/30 border-border hover:border-primary/50 transition-all rounded-md h-12 font-bold text-sm px-6"
          />
        </FormField>
      )}

      <FormField
        label="Mô tả & Sứ mệnh"
        description="Metadata giúp AI tối ưu hóa độ chính xác khi tạo nội dung tổng hợp."
      >
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData({
            ...formData,
            bio: e.target.value
          })}
          placeholder={
            formData.profile_type === 'business'
              ? "MÔ TẢ SỨ MỆNH, GIỌNG ĐIỆU THƯƠNG HIỆU VÀ CÁC GIÁ TRỊ CỐT LÕI..."
              : "MÔ TẢ TRỌNG TÂM SÁNG TẠO, ĐIỂM MẠNH CÁ NHÂN VÀ HOÀI BÃO CỦA BẠN..."
          }
          className="bg-muted/30 border-border hover:border-primary/50 transition-all rounded-lg min-h-[120px] font-medium text-sm p-6 leading-relaxed"
        />
        <div className="flex justify-between items-center pt-2">
          <span className="text-[10px] font-semibold text-primary/70">Bộ tối ưu AI đã được hiệu chỉnh</span>
          <span className={cn("text-[10px] font-bold", formData.bio.length > 450 ? 'text-destructive' : 'text-muted-foreground')}>
            {formData.bio.length} / 500
          </span>
        </div>
      </FormField>

      <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-border mt-10">
        <Button onClick={onSave} className="flex-1 h-12 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-sm transition-all">
          <Save className="mr-2 h-4 w-4" />
          {mode === 'create' ? 'KHỞI TẠO HỒ SƠ' : 'ĐỒNG BỘ DỮ LIỆU'}
        </Button>
        <Button onClick={onCancel} variant="outline" className="h-12 px-8 rounded-md border-border font-semibold text-sm hover:bg-muted text-muted-foreground transition-all">
          <X className="mr-2 h-4 w-4" />
          HỦY BỎ
        </Button>
      </div>
    </div>
  )
}

