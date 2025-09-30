"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApiTestPanel } from "@/components/debug/api-test-panel"
import { FacebookLinkButton } from "@/components/auth/facebook-link-button"
import { SelectPagesPicker } from "@/components/social/select-pages-picker"
import { SocialAccountsList } from "@/components/social/social-accounts-list"
import { Link as LinkIcon, Plus } from "lucide-react"

export function DashboardClient({ userId, email }: { userId: string; email?: string | null }) {
  const [openPicker, setOpenPicker] = useState(false)

  return (
    <>
      {/* Debug Panel - Remove in production */}
      <ApiTestPanel />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-500" />
            Liên kết Trang Facebook
          </CardTitle>
          <CardDescription>
            Kết nối tài khoản Facebook và chọn các trang để quản lý
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Kết nối tài khoản Facebook</h4>
              <p className="text-sm text-gray-600">
                Liên kết tài khoản Facebook của bạn để bắt đầu quản lý các trang
              </p>
              <FacebookLinkButton
                onSuccess={() => {
                  window.location.reload()
                }}
                onError={(error) => {
                  console.error('Facebook linking error:', error)
                  alert(`Không thể liên kết tài khoản Facebook: ${error}`)
                }}
                variant="default"
                size="sm"
              />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Chọn trang để liên kết</h4>
              <p className="text-sm text-gray-600">
                Sau khi kết nối, chọn các trang Facebook bạn muốn quản lý
              </p>
              <Button
                onClick={() => setOpenPicker(true)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Chọn trang
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SocialAccountsList
        userId={userId}
        onAccountClick={(account) => {
          if (account.provider === 'facebook') {
            setOpenPicker(true)
          }
        }}
        onTargetClick={(target, account) => {
          const url = `/dashboard/posts/new?accountId=${encodeURIComponent(account.id)}&targetId=${encodeURIComponent(target.id)}`
          window.location.href = url
        }}
      />

      <SelectPagesPicker open={openPicker} onOpenChange={setOpenPicker} onLinked={() => window.location.reload()} />
    </>
  )
}
