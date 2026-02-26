"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDeleteProfile, useGetProfile, useRestoreProfile } from "@/hooks/use-profiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, Edit, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ProfileTypeEnum } from "@/lib/utils/profile-utils";
import { cn } from "@/lib/utils";

export function ProfileDetail() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const { data: profile, isLoading, error } = useGetProfile(id)
  const deleteMutation = useDeleteProfile()
  const restoreMutation = useRestoreProfile()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Đã chuyển vào thùng rác')
      window.location.href = '/dashboard'
    } catch (e) {
      toast.error('Xóa thất bại')
    }
  }

  const handleRestore = async () => {
    try {
      await restoreMutation.mutateAsync(id)
      toast.success('Khôi phục thành công')
    } catch (e) {
      toast.error('Khôi phục thất bại')
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 md:p-10 bg-background flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4"></div>
        <p className="text-muted-foreground font-medium text-sm">Đang tải dữ liệu hồ sơ...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex-1 space-y-8 p-6 md:p-10 bg-background">
        <div className="flex items-center justify-between border-b border-border/50 pb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="h-10 px-6 rounded-md border-border font-bold text-xs uppercase tracking-wider hover:bg-muted text-muted-foreground shadow-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              QUAY LẠI
            </Button>
          </Link>
        </div>
        <Card className="rounded-lg border border-dashed border-border bg-muted/20">
          <CardContent className="py-24 text-center font-bold text-muted-foreground/40 text-xs italic uppercase tracking-widest">
            {error ? 'Hệ thống rơ-le gặp sự cố kết nối' : 'Thực thể hồ sơ không tồn tại'}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-background transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-10 transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="size-8 p-0 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground border-border/50 hover:bg-accent transition-all shadow-sm">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Hồ sơ tài khoản • Node Identity</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight italic uppercase">
            Chi chi tiết <span className="text-primary">Hồ sơ</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl italic leading-relaxed">
            Xem và quản lý thông tin định danh của bạn trong mạng lưới OmniAdly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/dashboard/profile/edit/${profile.id}`}>
            <Button variant="outline" className="h-11 px-8 rounded-md border-border font-bold text-xs uppercase tracking-wider hover:bg-muted shadow-sm transition-all hover:-translate-y-0.5">
              <Edit className="mr-2 h-4 w-4" />
              Hiệu chỉnh
            </Button>
          </Link>
          <Button variant="outline" onClick={handleRestore} className="h-11 px-8 rounded-md border-border hover:bg-muted font-bold text-xs uppercase tracking-wider shadow-sm transition-all hover:-translate-y-0.5">
            <RotateCcw className="mr-2 h-4 w-4" />
            Khôi phục
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="h-11 px-8 rounded-md bg-destructive text-white border-none font-bold text-xs uppercase tracking-wider shadow-lg transition-all hover:-translate-y-0.5">
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa thực thể
          </Button>
        </div>
      </div>

      <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden group transition-all duration-300">
        <CardHeader className="p-10 pb-6 border-b border-border/50 bg-muted/20">
          <CardTitle className="flex items-center gap-4 text-xl font-bold italic uppercase tracking-tight">
            <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
              <Building2 className="size-5" />
            </div>
            Thông tin định danh Node
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic mt-2">Dữ liệu hồ sơ doanh nghiệp hoặc cá nhân trên mạng lưới OmniAdly.</CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative size-40 rounded-lg overflow-hidden border border-border bg-muted/10 group-hover:scale-105 transition-transform duration-500 shrink-0 shadow-inner">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt="Avatar" className="object-cover h-full w-full" />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-bold text-5xl text-muted-foreground/20 italic">
                  {profile.company_name?.[0] || 'P'}
                </div>
              )}
              <div className="absolute bottom-3 right-3">
                <Badge variant="outline" className={cn(
                  "rounded-md px-2 py-0.5 font-bold text-[8px] uppercase tracking-widest shadow-lg border-border",
                  profile.profileType === ProfileTypeEnum.Pro ? "bg-amber-500 text-white border-amber-600" :
                    profile.profileType === ProfileTypeEnum.Basic ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground"
                )}>
                  {profile.profileType === ProfileTypeEnum.Pro ? "PRO" :
                    profile.profileType === ProfileTypeEnum.Basic ? "BASIC" : "FREE"}
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-3xl font-bold italic truncate">{profile.company_name || "Thực thể cá nhân"}</h3>
                <p className="text-[10px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-widest font-mono">NODE ID: {profile.id}</p>
              </div>
              {profile.bio && (
                <p className="text-sm font-medium text-muted-foreground italic leading-relaxed max-w-2xl border-l-4 border-primary/5 pl-6">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-10 border-t border-border/50">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Thời điểm khởi tạo</span>
              <p className="text-sm font-bold italic font-mono text-foreground/80">{new Date(profile.createdAt).toLocaleString('vi-VN').replace(/\//g, ' • ')}</p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Cập nhật cuối cùng</span>
              <p className="text-sm font-bold italic font-mono text-foreground/80">{new Date(profile.updatedAt).toLocaleString('vi-VN').replace(/\//g, ' • ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


