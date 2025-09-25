"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { SocialAccountsList } from "@/components/social/social-accounts-list";
import { SelectPagesPicker } from "@/components/social/select-pages-picker";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [openPicker, setOpenPicker] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Chào mừng bạn trở lại {user?.email ?? ""}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin người dùng</CardTitle>
          <CardDescription>Chi tiết tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Email:</span>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <div>
            <span className="font-medium">User ID:</span>
            <p className="text-sm text-gray-600 font-mono">{user?.id}</p>
          </div>
          <div>
            <span className="font-medium">Roles:</span>
            <p className="text-sm text-gray-600">{user?.roles?.join(', ')}</p>
          </div>
        </CardContent>
      </Card>

      {isAuthenticated && user && (
        <SocialAccountsList
          userId={user.id}
          onAccountClick={(account) => {
            if (account.provider === 'facebook') {
              setOpenPicker(true)
            }
          }}
          onTargetClick={(target, account) => {
            const url = `/dashboard/posts/new?accountId=${encodeURIComponent(account.id)}&targetId=${encodeURIComponent(target.id)}`
            router.push(url)
          }}
        />
      )}

      <SelectPagesPicker open={openPicker} onOpenChange={setOpenPicker} onLinked={() => window.location.reload()} />
    </div>
  );
}
