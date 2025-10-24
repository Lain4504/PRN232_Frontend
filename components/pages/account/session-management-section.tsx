"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Monitor, Smartphone, Globe, Shield, LogOut, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export function SessionManagementSection() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Mock session data - Supabase doesn't provide session management API directly
        // In a real implementation, you would call your backend API to get session info
        const mockSessions: SessionInfo[] = [
          {
            id: "current-session",
            device: "Desktop",
            browser: "Chrome 120.0",
            location: "Ho Chi Minh City, Vietnam",
            lastActive: new Date().toISOString(),
            current: true
          },
          {
            id: "mobile-session",
            device: "Mobile",
            browser: "Safari 17.0",
            location: "Ho Chi Minh City, Vietnam",
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            current: false
          },
          {
            id: "tablet-session",
            device: "Tablet",
            browser: "Chrome 119.0",
            location: "Hanoi, Vietnam",
            lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            current: false
          }
        ];
        
        setSessions(mockSessions);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error("Failed to load session information");
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      setRevokingSession(sessionId);
      
      // Mock revoke session - In real implementation, call your backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success("Session revoked successfully");
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error("Failed to revoke session");
    } finally {
      setRevokingSession(null);
    }
  };

  const revokeAllOtherSessions = async () => {
    try {
      setRevokingSession("all-other");
      
      // Mock revoke all other sessions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessions(prev => prev.filter(session => session.current));
      toast.success("All other sessions revoked successfully");
    } catch (error) {
      console.error("Error revoking sessions:", error);
      toast.error("Failed to revoke sessions");
    } finally {
      setRevokingSession(null);
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Session Management
          </CardTitle>
          <Separator />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Session Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage your active login sessions across devices
        </p>
        <Separator />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Session Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Current Session</span>
          </div>
          <p className="text-xs text-muted-foreground">
            This is your current active session. You can see other devices that are signed in to your account.
          </p>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(session.device)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.device}</span>
                      {session.current && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success/10 text-success border border-success/20">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.browser} • {session.location}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last active: {formatLastActive(session.lastActive)}
                    </div>
                  </div>
                </div>
              </div>
              
              {!session.current && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revokeSession(session.id)}
                  disabled={revokingSession === session.id}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {revokingSession === session.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Revoke All Other Sessions */}
        {sessions.filter(s => !s.current).length > 0 && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={revokeAllOtherSessions}
              disabled={revokingSession === "all-other"}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {revokingSession === "all-other" ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Revoking Sessions...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Revoke All Other Sessions
                </>
              )}
            </Button>
          </div>
        )}

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            If you notice any suspicious activity or unrecognized sessions, revoke them immediately and consider changing your password.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
