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
        <div className="flex items-center justify-between border-b border-border pb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="h-10 px-6 rounded-md border-border font-semibold text-sm hover:bg-muted text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              QUAY LẠI
            </Button>
          </Link>
        </div>
        <Card className="rounded-lg border border-dashed border-border bg-muted/30">
          <CardContent className="py-20 text-center font-bold text-muted-foreground text-sm">
            {error ? 'CÓ LỖI XẢY RA KHI TẢI HỒ SƠ' : 'KHÔNG TÌM THẤY HỒ SƠ'}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-10 bg-background transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-8 text-foreground">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="size-8 p-0 rounded-md bg-muted flex items-center justify-center text-muted-foreground border-none hover:bg-accent transition-all">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <span className="text-[11px] font-semibold text-muted-foreground">Hồ sơ tài khoản / Chi tiết</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
            CHI TIẾT <span className="text-primary">HỒ SƠ</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl leading-relaxed">
            Xem và quản lý thông tin định danh của bạn trong hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href={`/dashboard/profile/edit/${profile.id}`}>
            <Button variant="outline" className="h-12 px-8 rounded-md border-border font-bold text-sm hover:bg-muted text-muted-foreground shadow-sm transition-all">
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Link>
          <Button variant="outline" onClick={handleRestore} className="h-12 px-8 rounded-md border-border hover:bg-muted text-muted-foreground font-bold text-sm shadow-sm transition-all">
            <RotateCcw className="mr-2 h-4 w-4" />
            Khôi phục
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="h-12 px-8 rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-sm shadow-sm transition-all border-none">
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa hồ sơ
          </Button>
        </div>
      </div>

      <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden group transition-all duration-300">
        <CardHeader className="p-8 pb-4 border-b border-border">
          <CardTitle className="flex items-center gap-4 text-xl font-bold text-foreground">
            <div className="size-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="size-5" />
            </div>
            THÔNG TIN ĐỊNH DANH
          </CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground mt-2">Dữ liệu hồ sơ doanh nghiệp hoặc cá nhân trên OmniAdly.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative size-32 rounded-lg overflow-hidden border border-border bg-muted/30 group-hover:scale-105 transition-transform duration-500 shrink-0">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt="Avatar" className="object-cover h-full w-full" />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-bold text-4xl text-muted-foreground">
                  {profile.company_name?.[0] || 'P'}
                </div>
              )}
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className={cn(
                  "rounded-sm px-2 py-0.5 font-semibold text-[9px] border-none shadow-sm",
                  profile.profileType === ProfileTypeEnum.Pro ? "bg-amber-500 text-white" :
                    profile.profileType === ProfileTypeEnum.Basic ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {profile.profileType === ProfileTypeEnum.Pro ? "PRO" :
                    profile.profileType === ProfileTypeEnum.Basic ? "BASIC" : "FREE"}
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-3 text-center md:text-left">
              <div>
                <h3 className="text-2xl font-bold text-foreground">{profile.company_name || "Hồ sơ cá nhân"}</h3>
                <p className="text-[10px] font-semibold text-muted-foreground mt-1">ID HỒ SƠ: {profile.id}</p>
              </div>
              {profile.bio && (
                <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-xl">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-border">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground">Ngày khởi tạo</span>
              <p className="text-sm font-bold text-foreground">{new Date(profile.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground">Cập nhật cuối</span>
              <p className="text-sm font-bold text-foreground">{new Date(profile.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


