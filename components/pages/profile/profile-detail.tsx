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
      <div className="flex-1 space-y-6 p-6 md:p-10 bg-background transition-all duration-300">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-6"></div>
          <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px]">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex-1 space-y-12 p-6 md:p-10 bg-background transition-all duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-12">
          <Link href="/dashboard">
            <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <ArrowLeft className="mr-2 h-4 w-4 opacity-50" />
              QUAY LẠI
            </Button>
          </Link>
        </div>
        <Card className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="py-20 text-center font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-xs">
            {error ? 'CÓ LỖI XẢY RA KHI TẢI HỒ SƠ' : 'KHÔNG TÌM THẤY HỒ SƠ'}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-12 p-6 md:p-10 bg-background font-sans transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-12 text-slate-900 dark:text-white">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="size-8 p-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 border-none hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Hồ sơ tài khoản / Chi tiết</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase">
            CHI TIẾT HỒ SƠ
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
            Xem và quản lý thông tin định danh của bạn trong hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href={`/dashboard/profile/edit/${profile.id}`}>
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all hover:-translate-y-1">
              <Edit className="mr-3 h-4 w-4 opacity-70" />
              Chỉnh sửa
            </Button>
          </Link>
          <Button variant="default" onClick={handleRestore} className="h-14 px-8 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] transition-all hover:-translate-y-1 border-none shadow-sm">
            <RotateCcw className="mr-3 h-4 w-4 opacity-70" />
            Khôi phục
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="h-14 px-8 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-rose-200 dark:shadow-none transition-all hover:-translate-y-1 border-none">
            <Trash2 className="mr-3 h-4 w-4" />
            Xóa hồ sơ
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-black/40 overflow-hidden relative group transition-all duration-300">
        <CardHeader className="p-8 pb-4 border-b border-slate-50 dark:border-slate-800/50">
          <CardTitle className="flex items-center gap-4 text-xl font-black uppercase text-slate-900 dark:text-white">
            <div className="size-10 rounded-xl bg-slate-900 dark:bg-primary flex items-center justify-center text-white">
              <Building2 className="size-5" />
            </div>
            THÔNG TIN ĐỊNH DANH
          </CardTitle>
          <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-2 uppercase tracking-tighter">Dữ liệu hồ sơ doanh nghiệp hoặc cá nhân trên OmniAdly.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative group/avatar">
              <Avatar className="h-32 w-32 rounded-3xl border-4 border-slate-50 dark:border-slate-800 shadow-lg transition-transform duration-500 group-hover/avatar:scale-105">
                {profile.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt="Avatar" className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-slate-900 dark:bg-primary text-white text-3xl font-black">{profile.company_name?.[0] || 'P'}</AvatarFallback>
                )}
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <Badge className={cn("rounded-lg px-2.5 py-1 font-black uppercase tracking-widest text-[9px] border-none shadow-lg",
                  profile.profileType === ProfileTypeEnum.Pro ? "bg-amber-500 text-white" :
                    profile.profileType === ProfileTypeEnum.Basic ? "bg-primary text-white" : "bg-slate-500 text-white")}>
                  {profile.profileType === ProfileTypeEnum.Pro ? "PRO" :
                    profile.profileType === ProfileTypeEnum.Basic ? "BASIC" : "FREE"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{profile.company_name || "Chưa đặt tên công ty"}</h3>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mt-1">ID HỒ SƠ: {profile.id}</p>
              </div>
              {profile.bio && (
                <div className="relative py-4 px-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-l-4 border-primary italic">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-slate-50 dark:border-slate-800/50">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ngày khởi tạo</span>
              <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(profile.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Cập nhật cuối</span>
              <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(profile.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


