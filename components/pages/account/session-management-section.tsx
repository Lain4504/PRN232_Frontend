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
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 w-full bg-card animate-pulse rounded-lg border border-border" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
          <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
            <Activity className="size-4" />
          </div>
          Phiên hoạt động
        </h2>
        {sessions.filter(s => !s.current).length > 0 && (
          <button
            onClick={revokeAllOtherSessions}
            disabled={revokingSession === "all-other"}
            className="text-[10px] font-bold uppercase tracking-widest text-destructive hover:underline disabled:opacity-50"
          >
            Đăng xuất tất cả
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className={cn(
              "rounded-lg border-border bg-card transition-all duration-300 shadow-sm",
              session.current && "border-primary/20 bg-muted/30"
            )}
          >
            <CardContent className="p-5 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "size-10 rounded flex items-center justify-center",
                  session.current
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground/50 border border-border"
                )}>
                  {session.device.includes("Máy tính") ? <Monitor className="size-5" /> : <Smartphone className="size-5" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{session.device}</span>
                    {session.current && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Phiên hiện tại
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Globe className="size-3 opacity-50" /> {session.browser}</span>
                    <span className="flex items-center gap-1"><MapPin className="size-3 opacity-50" /> {session.location}</span>
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
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
                  className="rounded-md h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  {revokingSession === session.id ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Đăng xuất
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="rounded-lg border bg-muted/50 p-4 flex flex-row items-start gap-3 h-auto">
        <Shield className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
        <AlertDescription className="text-xs font-medium text-muted-foreground leading-relaxed">
          Nếu bạn nhận thấy bất kỳ hoạt động bất thường nào hoặc phiên đăng nhập lạ, hãy đăng xuất chúng ngay lập tức và cân nhắc việc đổi mật khẩu để bảo vệ tài khoản.
        </AlertDescription>
      </Alert>
    </div>
  )
}
