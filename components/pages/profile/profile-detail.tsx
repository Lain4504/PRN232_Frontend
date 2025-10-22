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
      window.location.href = '/dashboard/profile'
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
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/profile">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {error ? 'Có lỗi xảy ra khi tải hồ sơ' : 'Không tìm thấy hồ sơ'}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/profile">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/dashboard/profile/edit/${profile.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
          <Button variant="default" size="sm" onClick={handleRestore}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Khôi phục
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Thông tin hồ sơ
          </CardTitle>
          <CardDescription>Hiển thị chi tiết hồ sơ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="Avatar" />
              ) : (
                <AvatarFallback>{profile.company_name?.[0] || 'P'}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <Badge variant={profile.profile_type === 'business' ? 'default' : 'secondary'}>
                  {profile.profile_type}
                </Badge>
                {profile.company_name && (
                  <h3 className="font-semibold text-lg">{profile.company_name}</h3>
                )}
              </div>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{profile.bio}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Created:</span> {new Date(profile.created_at).toLocaleString()}
            </div>
            <div>
              <span className="font-medium text-foreground">Updated:</span> {new Date(profile.updated_at).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


