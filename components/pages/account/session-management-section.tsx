"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Monitor, Smartphone, Globe, Shield, LogOut, RefreshCw, MapPin, Activity } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface SessionInfo {
  id: string
  device: string
  browser: string
  location: string
  lastActive: string
  current: boolean
}

export function SessionManagementSection() {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [revokingSession, setRevokingSession] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      const mockSessions: SessionInfo[] = [
        {
          id: "current-session",
          device: "Máy tính để bàn",
          browser: "Chrome 120.0",
          location: "Hồ Chí Minh, Việt Nam",
          lastActive: new Date().toISOString(),
          current: true
        },
        {
          id: "mobile-session",
          device: "Di động",
          browser: "Safari 17.0",
          location: "Hồ Chí Minh, Việt Nam",
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          current: false
        },
        {
          id: "tablet-session",
          device: "Máy tính bảng",
          browser: "Chrome 119.0",
          location: "Hà Nội, Việt Nam",
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          current: false
        }
      ]
      setSessions(mockSessions)
    } catch (error) {
      toast.error("Không thể tải danh sách phiên đăng nhập")
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      setRevokingSession(sessionId)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSessions(prev => prev.filter(session => session.id !== sessionId))
      toast.success("Đã đăng xuất thiết bị thành công")
    } catch (error) {
      toast.error("Không thể đăng xuất thiết bị")
    } finally {
      setRevokingSession(null)
    }
  }

  const revokeAllOtherSessions = async () => {
    try {
      setRevokingSession("all-other")
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSessions(prev => prev.filter(session => session.current))
      toast.success("Đã đăng xuất tất cả các thiết bị khác")
    } catch (error) {
      toast.error("Lỗi khi đăng xuất các thiết bị")
    } finally {
      setRevokingSession(null)
    }
  }

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Vừa mới đây"
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    return `${Math.floor(diffInHours / 24)} ngày trước`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 w-full bg-slate-50 dark:bg-slate-900 animate-pulse rounded-2xl border border-slate-100 dark:border-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
          <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <Activity className="size-4" />
          </div>
          Phiên hoạt động
        </h2>
        {sessions.filter(s => !s.current).length > 0 && (
          <Button
            variant="ghost"
            onClick={revokeAllOtherSessions}
            disabled={revokingSession === "all-other"}
            className="text-xs font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl px-4"
          >
            Đăng xuất tất cả
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className={cn(
              "rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 shadow-sm hover:shadow-md",
              session.current && "border-slate-900/10 dark:border-primary/20 ring-1 ring-slate-100 dark:ring-slate-800 flex-1 overflow-visible"
            )}
          >
            <CardContent className="p-6 md:p-8 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "size-14 rounded-2xl flex items-center justify-center",
                  session.current
                    ? "bg-slate-900 dark:bg-primary text-white shadow-xl shadow-slate-200 dark:shadow-primary/20"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700"
                )}>
                  {session.device.includes("Máy tính") ? <Monitor className="size-6" /> : <Smartphone className="size-6" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-white text-lg">{session.device}</span>
                    {session.current && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                        Phiên hiện tại
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1.5"><Globe className="size-3.5 opacity-50" /> {session.browser}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="size-3.5 opacity-50" /> {session.location}</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">
                    Hoạt động cuối: {formatLastActive(session.lastActive)}
                  </p>
                </div>
              </div>

              {!session.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeSession(session.id)}
                  disabled={revokingSession === session.id}
                  className="rounded-xl h-10 px-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                >
                  {revokingSession === session.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  Đăng xuất
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 border-none p-6 flex flex-row items-start gap-4 h-auto">
        <Shield className="h-5 w-5 text-slate-900 dark:text-white shrink-0" />
        <AlertDescription className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed pt-0.5">
          Nếu bạn nhận thấy bất kỳ hoạt động bất thường nào hoặc phiên đăng nhập lạ, hãy đăng xuất chúng ngay lập tức và cân nhắc việc đổi mật khẩu để bảo vệ tài khoản.
        </AlertDescription>
      </Alert>
    </div>
  )
}
