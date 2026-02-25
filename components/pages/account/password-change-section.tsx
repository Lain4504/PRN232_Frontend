"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Eye, EyeOff, Lock, AlertCircle, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, endpoints } from "@/lib/api"
import { useRouter } from "next/navigation"

export function PasswordChangeSection() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(newPassword)

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return "bg-rose-500"
    if (strength <= 3) return "bg-amber-500"
    if (strength <= 4) return "bg-blue-500"
    return "bg-emerald-500"
  }

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return "Yếu"
    if (strength <= 3) return "Trung bình"
    if (strength <= 4) return "Tốt"
    return "Mạnh"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ các thông tin.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }

    setIsLoading(true)

    try {
      const response = await api.post(endpoints.changePassword, {
        currentPassword,
        newPassword,
        confirmPassword
      })

      if (response.success) {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        toast.success("Cập nhật mật khẩu thành công! Vui lòng đăng nhập lại.")

        // Clear session and redirect to login after a short delay
        setTimeout(() => {
          localStorage.removeItem("auth_session")
          document.cookie = "auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
          document.cookie = "refresh_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
          router.push("/auth/login")
        }, 2000)
      } else {
        setError(response.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.")
        toast.error("Cập nhật mật khẩu thất bại")
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Đã có lỗi xảy ra. Vui lòng thử lại sau."
      console.error("Change password error:", err)
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-6">
        <div className="size-8 rounded bg-muted flex items-center justify-center text-muted-foreground">
          <Lock className="size-4" />
        </div>
        Đổi mật khẩu
      </h2>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {newPassword && (
                  <div className="pt-2 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-500", getStrengthColor(passwordStrength))}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm ring-1 ring-destructive/20">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </Button>
            </form>

            {/* Requirements Column */}
            <div className="bg-muted/50 rounded-lg p-6 border border-border self-start space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Yêu cầu bảo mật</h3>
                <ul className="space-y-3">
                  {[
                    "Tối thiểu 8 ký tự",
                    "Bao gồm chữ cái và số",
                    "Bao gồm ký tự đặc biệt (@, #, $...)"
                  ].map((req, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="size-1 bg-muted-foreground/30 rounded-full" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Omniadly khuyến nghị bạn sử dụng mật khẩu mạnh để bảo vệ dữ liệu AI của mình.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
