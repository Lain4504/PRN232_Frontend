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

  const handleEditProfile = (profile: { id: string; profileType: 'Free' | 'Basic' | 'Pro'; company_name?: string; bio?: string; avatarUrl?: string }) => {
    setEditingProfileId(profile.id)
    const profileType = profile.profileType === 'Free' ? 'personal' : 'business';
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
      <div className="w-full max-w-full overflow-x-hidden font-fira-sans">
        <div className="space-y-10 p-6 lg:p-10 bg-background">
          <Skeleton className="h-4 w-48" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-6 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalProfiles = profiles.length;
  const businessProfiles = profiles.filter(p => p.profileType === 'Pro' || p.profileType === 'Basic').length;
  const personalProfiles = profiles.filter(p => p.profileType === 'Free').length;

  return (
    <div className="max-w-[1440px] mx-auto font-fira-sans">
      <div className="space-y-10 p-6 lg:p-10 bg-background">

        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Security Protocol Alpha</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
              Identity <span className="text-primary italic">Management</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl tracking-tight leading-relaxed">
              Configure and coordinate your multi-domain identities. Synchronize metadata for enhanced AI persona generation.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-4 bg-card/40 backdrop-blur-xl rounded-2xl border border-border/40 shadow-xl flex items-center gap-8">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Active Nodes</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-foreground">{totalProfiles}</div>
              </div>
              <div className="h-8 w-px bg-border/20" />
              <div className="space-y-1">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Security</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-primary uppercase leading-none italic">Verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Command Matrix Grid */}
        <div className="grid lg:grid-cols-12 gap-10">

          {/* Left Sidebar - Quick Actions & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-2xl overflow-hidden group">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <Plus className="h-6 w-6 stroke-[3]" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Node Initiation</h3>
                </div>
                <p className="text-sm font-medium text-muted-foreground tracking-tight leading-relaxed">
                  Initialize a new identity node to branch into unique creative directions or separate organization assets.
                </p>
                <Button onClick={handleCreateProfile} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02]">
                  <Plus className="mr-2 h-4 w-4 stroke-[3]" />
                  Deploy New Identity
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-muted/20 border border-border/40 rounded-3xl space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Business</p>
                <p className="text-3xl font-black font-fira-mono tabular-nums leading-none">{businessProfiles}</p>
              </div>
              <div className="p-6 bg-muted/20 border border-border/40 rounded-3xl space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Personal</p>
                <p className="text-3xl font-black font-fira-mono tabular-nums leading-none">{personalProfiles}</p>
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/20 rounded-2xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-primary stroke-[2.5]" />
                <h4 className="font-black uppercase tracking-tight text-primary">Identity Protocol</h4>
              </div>
              <p className="text-sm font-medium leading-relaxed tracking-tight text-primary/80">
                Your identities serve as the neural foundation for AI content generation. Higher quality descriptors lead to superior output precision.
              </p>
            </Card>
          </div>

          {/* Right Main - Directory */}
          <div className="lg:col-span-8 space-y-8">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground stroke-[2.5]" />
                <Input
                  placeholder="SCAN IDENTITY DIRECTORY..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-14 bg-card/40 border-border/40 rounded-2xl font-black text-[10px] uppercase tracking-widest focus:ring-primary/20"
                />
              </div>
              <Button
                variant={showDeleted ? 'default' : 'outline'}
                onClick={() => setShowDeleted(v => !v)}
                className="h-14 px-8 rounded-2xl border-border/40 font-black text-[10px] uppercase tracking-widest transition-all"
              >
                {showDeleted ? 'ARCHIVE DATASET' : 'ACTIVE DATASET'}
              </Button>
            </div>

            {/* Identity Matrix */}
            {profiles.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {profiles.map((profile) => {
                  const profileType = profile.profileType === 'Free' ? 'personal' : 'business';
                  return (
                    <Card key={profile.id} className="group relative bg-card/40 backdrop-blur-xl border-border/40 hover:border-primary/50 rounded-2xl transition-all duration-300 shadow-xl shadow-black/5 overflow-hidden">
                      <CardContent className="p-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                          <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-border/40 shadow-inner group-hover:scale-105 transition-transform duration-500 shrink-0">
                            {profile.avatarUrl ? (
                              <AvatarImage src={profile.avatarUrl} alt="" className="object-cover h-full w-full" />
                            ) : (
                              <div className="h-full w-full bg-muted/50 flex items-center justify-center font-black text-2xl text-muted-foreground">
                                {profile.company_name?.[0].toUpperCase() || 'P'}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-4 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <Badge className={`h-6 px-3 rounded-lg border-none font-black text-[9px] uppercase tracking-widest justify-center sm:justify-start
                                      ${profileType === 'business' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                {profileType} NODE
                              </Badge>
                              <h3 className="text-xl font-black uppercase tracking-tight text-foreground truncate">
                                {profile.company_name || 'Personal Identity'}
                              </h3>
                            </div>

                            {profile.bio && (
                              <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed tracking-tight max-w-xl">
                                {profile.bio}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-2">
                              <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Initialized</p>
                                <p className="text-xs font-black font-fira-mono tracking-tight uppercase tabular-nums">
                                  {new Date(profile.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="h-6 w-px bg-border/20 hidden sm:block" />
                              <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Status</p>
                                <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Live Node</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-2 shrink-0">
                            <Button onClick={() => handleViewProfile(profile.id)} variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border/40 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-all group/btn">
                              <Eye className="h-5 w-5 stroke-[2.5] group-hover/btn:scale-110 transition-transform" />
                            </Button>
                            <Button onClick={() => handleEditProfile(profile)} variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border/40 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-all group/btn">
                              <Edit className="h-5 w-5 stroke-[2.5] group-hover/btn:scale-110 transition-transform" />
                            </Button>
                            {!showDeleted ? (
                              <Button onClick={() => handleDeleteProfile(profile.id)} variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border/40 hover:bg-destructive/10 hover:border-destructive/50 text-destructive transition-all group/btn">
                                <Trash2 className="h-5 w-5 stroke-[2.5] group-hover/btn:scale-110 transition-transform" />
                              </Button>
                            ) : (
                              <Button onClick={() => handleRestoreProfile(profile.id)} variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border/40 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-500 transition-all group/btn">
                                <RotateCcw className="h-5 w-5 stroke-[2.5] group-hover/btn:scale-110 transition-transform" />
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
              <Card className="border-4 border-dashed border-border/40 bg-card/20 backdrop-blur-sm rounded-2xl p-24 text-center space-y-8">
                <div className="mx-auto h-24 w-24 rounded-2xl bg-muted/20 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-muted-foreground stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black uppercase tracking-tight">Directory Vacuum</h3>
                  <p className="text-muted-foreground font-medium max-w-sm mx-auto tracking-tight leading-relaxed">
                    No identities detected in the current sector dataset. Initialize the first node to begin operation.
                  </p>
                </div>
                <Button onClick={handleCreateProfile} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/40 transition-all hover:scale-110">
                  <Plus className="mr-3 h-5 w-5 stroke-[3]" />
                  Initialize Node 01
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Tactical Interaction Portals (Modals) */}
        {(viewingProfileId || editingProfileId || creatingProfile) && (
          isMobile ? (
            <Drawer open={!!(viewingProfileId || editingProfileId || creatingProfile)} onOpenChange={handleCloseModal}>
              <DrawerContent className="max-h-[85vh] font-fira-sans border-t-border/40 bg-background/95 backdrop-blur-3xl p-6">
                <DrawerHeader className="px-0 pb-8 space-y-2">
                  <DrawerTitle className="text-2xl font-black uppercase tracking-tight">
                    {creatingProfile ? 'Node Initiation' : editingProfileId ? 'Structural Modification' : 'Node Diagnostics'}
                  </DrawerTitle>
                  <DrawerDescription className="text-sm font-bold text-primary italic uppercase tracking-widest opacity-80">
                    {creatingProfile ? 'Initializing identity matrix Alpha' : editingProfileId ? 'Synchronizing metadata structure' : 'Analyzing biometric & branding data'}
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
              <DialogContent className="max-w-2xl font-fira-sans rounded-2xl border-border/40 bg-background/95 backdrop-blur-3xl p-12 shadow-[0_0_100px_rgba(0,0,0,0.3)]">
                <DialogHeader className="pb-10 space-y-2 text-left">
                  <DialogTitle className="text-3xl font-black uppercase tracking-tight">
                    {creatingProfile ? 'Node Initiation' : editingProfileId ? 'Structural Modification' : 'Node Diagnostics'}
                  </DialogTitle>
                  <DialogDescription className="text-base font-bold text-primary italic uppercase tracking-widest opacity-80 border-l-4 border-primary pl-4">
                    {creatingProfile ? 'Initializing identity matrix Alpha' : editingProfileId ? 'Synchronizing metadata structure' : 'Analyzing biometric & branding data'}
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[60vh] pr-4">
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
          <AlertDialogContent className="max-w-md font-fira-sans rounded-2xl border-border/40 bg-background/95 backdrop-blur-3xl p-10 shadow-2xl">
            <AlertDialogHeader className="space-y-4">
              <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Authorize Termination?</AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium text-muted-foreground leading-relaxed">
                Confirming this action will relocate the identity node to the <span className="text-destructive font-black">Archive Sector</span>. Node reactivation is possible via Chronos Restore.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-4 pt-6">
              <AlertDialogCancel className="w-full sm:w-auto h-12 rounded-xl font-black uppercase tracking-widest text-[10px] bg-muted/20 border-none">Abort Mission</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProfile}
                className="w-full sm:w-auto h-12 rounded-xl font-black uppercase tracking-widest text-[10px] bg-destructive hover:bg-destructive/90 text-white shadow-2xl shadow-destructive/20"
              >
                Confirm Termination
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
      <div className="flex flex-col items-center justify-center py-20 italic font-black uppercase tracking-widest text-primary/70 animate-pulse text-xs">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
        Deciphering Profile Matrix...
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20 space-y-4">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
        <p className="font-black uppercase tracking-widest text-muted-foreground opacity-50">NODE DATA CORRUPTED OR NOT FOUND</p>
      </div>
    )
  }

  const profileData = profile
  const profileType = profileData.profileType === 'Free' ? 'personal' : 'business'

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">
        <div className="relative h-32 w-32 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl shrink-0">
          {profileData.avatarUrl ? (
            <AvatarImage src={profileData.avatarUrl} alt="Avatar" className="object-cover h-full w-full" />
          ) : (
            <div className="h-full w-full bg-primary/5 flex items-center justify-center font-black text-3xl text-primary/40 uppercase">
              {profileData.company_name?.[0] || 'P'}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Badge className={`h-7 px-4 rounded-xl border-none font-black text-[10px] uppercase tracking-[0.2em] justify-center
               ${profileType === 'business' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {profileType} IDENT
            </Badge>
            {profileData.company_name && (
              <h3 className="font-black text-2xl uppercase tracking-tighter">{profileData.company_name}</h3>
            )}
          </div>
          {profileData.bio && (
            <p className="text-base font-medium text-muted-foreground leading-relaxed tracking-tight max-w-xl">
              {profileData.bio}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-border/20">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Original Timestamp</p>
          <p className="text-sm font-black font-fira-mono tracking-tight uppercase tabular-nums text-foreground">
            {new Date(profileData.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Latest Multi-Sync</p>
          <p className="text-sm font-black font-fira-mono tracking-tight uppercase tabular-nums text-foreground">
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
    <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-border/40 shadow-inner shrink-0 cursor-pointer group hover:scale-105 transition-transform duration-500">
      <Avatar className="h-full w-full rounded-none">
        <AvatarImage src={avatarSrc} alt="" className="object-cover h-full w-full" />
        <AvatarFallback className="bg-muted/50 rounded-none">
          {profileType === 'business' ? <Building2 className="h-8 w-8 text-muted-foreground" /> : <User className="h-8 w-8 text-muted-foreground" />}
        </AvatarFallback>
      </Avatar>
      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Plus className="h-6 w-6 text-white stroke-[3]" />
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
      <FormField label="Identity Sector Type" required>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div
            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${formData.profile_type === 'personal'
              ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5'
              : 'border-border/40 hover:border-primary/40 hover:bg-muted/30'
              }`}
            onClick={() => setFormData({
              ...formData,
              profile_type: 'personal',
              company_name: formData.profile_type === 'business' ? '' : formData.company_name
            })}
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${formData.profile_type === 'personal' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
                <User className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-sm uppercase tracking-tight">Personal Node</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60">
                  Individual / Freelancer
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${formData.profile_type === 'business'
              ? 'border-primary bg-primary/5 shadow-xl shadow-primary/5'
              : 'border-border/40 hover:border-primary/40 hover:bg-muted/30'
              }`}
            onClick={() => setFormData({
              ...formData,
              profile_type: 'business'
            })}
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${formData.profile_type === 'business' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
                <Building2 className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-sm uppercase tracking-tight">Business Node</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60">
                  Corporate / Organization
                </p>
              </div>
            </div>
          </div>
        </div>
      </FormField>

      <FormField label="Visual Identifier" description="Biometric signal for identity matrix recognition.">
        <div className="flex items-center gap-8 pt-2">
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
                className="bg-muted/20 border-border/40 hover:border-primary/40 transition-all rounded-xl h-12 pt-2 text-[10px] font-black uppercase tracking-widest cursor-pointer file:bg-primary file:text-primary-foreground file:border-none file:rounded-lg file:mr-4 file:px-4 file:py-1 file:font-black file:text-[9px] file:uppercase"
              />
            </div>
            <div className="relative">
              <Input
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="URL: HTTPS://ASSETS.AISAM.IO/USER_01.JPG"
                className="bg-muted/20 border-border/40 hover:border-primary/40 transition-all rounded-xl h-12 font-black text-[10px] uppercase tracking-[0.1em]"
              />
            </div>
          </div>
        </div>
      </FormField>

      {formData.profile_type === 'business' && (
        <FormField label="Organizational Designation" required>
          <Input
            value={formData.company_name}
            onChange={(e) => setFormData({
              ...formData,
              company_name: e.target.value
            })}
            placeholder="LEGAL ENTITY NAME"
            required
            className="bg-muted/20 border-border/40 hover:border-primary/40 transition-all rounded-xl h-14 font-black uppercase tracking-tight text-base px-6"
          />
        </FormField>
      )}

      <FormField
        label="Sector Descriptor & Mission"
        description="Metadata facilitates higher-precision synthetic content generation."
      >
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData({
            ...formData,
            bio: e.target.value
          })}
          placeholder={
            formData.profile_type === 'business'
              ? "ARTICULATE MISSION PARAMETERS, BRAND VOICE, AND CORE VALUES..."
              : "DESCRIBE CREATIVE FOCUS, INDIVIDUAL STRENGTHS, AND AMBITIONS..."
          }
          className="bg-muted/20 border-border/40 hover:border-primary/40 transition-all rounded-2xl min-h-[120px] font-medium text-sm p-6 leading-relaxed tracking-tight"
        />
        <div className="flex justify-between items-center pt-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">AI Optimizer calibrated</span>
          <span className={`text-[10px] font-black font-fira-mono tracking-widest ${formData.bio.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {formData.bio.length} / 500
          </span>
        </div>
      </FormField>

      <div className="flex flex-col sm:flex-row gap-4 pt-10">
        <Button onClick={onSave} className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02]">
          <Save className="mr-3 h-5 w-5 stroke-[2.5]" />
          {mode === 'create' ? 'INITIATE NODE' : 'SYNC METADATA'}
        </Button>
        <Button onClick={onCancel} variant="outline" className="h-14 px-10 rounded-2xl border-border/40 font-black uppercase tracking-widest text-xs hover:bg-muted/50 transition-all">
          <X className="mr-3 h-5 w-5 stroke-[2.5]" />
          ABORT
        </Button>
      </div>
    </div>
  )
}

