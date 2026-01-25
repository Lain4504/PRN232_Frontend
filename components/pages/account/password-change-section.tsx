"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export function PasswordChangeSection() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
    setSuccess(false)

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
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Cập nhật mật khẩu thành công!")
    } catch (err: unknown) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại sau.")
      toast.error("Cập nhật mật khẩu thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest flex items-center gap-3">
        <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
          <Lock className="size-4" />
        </div>
        Đổi mật khẩu
      </h2>

      <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-sm overflow-hidden">
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              {/* Current Password */}
              <div className="space-y-3">
                <Label htmlFor="currentPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Mật khẩu hiện tại
                </Label>
                <div className="relative group">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 bg-slate-50 border-none rounded-xl pr-12 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-3">
                <Label htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Mật khẩu mới
                </Label>
                <div className="relative group">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 bg-slate-50 border-none rounded-xl pr-12 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="pt-2 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-500", getStrengthColor(passwordStrength))}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Xác nhận mật khẩu mới
                </Label>
                <div className="relative group">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 bg-slate-50 border-none rounded-xl pr-12 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold ring-1 ring-rose-100">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xl shadow-slate-200 transition-all disabled:opacity-50"
              >
                {isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
              </Button>
            </div>

            {/* Requirements Column */}
            <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100/50 self-start">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="size-5 text-slate-900" />
                <h4 className="text-sm font-bold text-slate-900">Yêu cầu bảo mật</h4>
              </div>
              <ul className="space-y-4">
                {[
                  "Tối thiểu 8 ký tự",
                  "Chứa ít nhất một chữ hoa",
                  "Chứa ít nhất một chữ thường",
                  "Chứa ít nhất một con số",
                  "Chứa ít nhất một ký tự đặc biệt"
                ].map((req, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <div className="size-1 bg-slate-300 rounded-full" />
                    {req}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-8 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  omniadly khuyến nghị bạn sử dụng mật khẩu mạnh để bảo vệ dự án và dữ liệu AI của mình.
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
