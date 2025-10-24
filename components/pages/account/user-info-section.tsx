"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Mail, User as UserIcon, Calendar, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function UserInfoSection() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Account Information</CardTitle>
          <Separator />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Account Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your account details and security information
        </p>
        <Separator />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mail className="h-4 w-4" />
              Email Address
            </div>
            <p className="text-sm font-medium">{user.email}</p>
          </div>

          {/* User ID */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="h-4 w-4" />
              User ID
            </div>
            <p className="text-sm font-mono bg-muted/50 px-2 py-1 rounded text-xs">
              {user.id}
            </p>
          </div>

          {/* Created At */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Member Since
            </div>
            <p className="text-sm font-medium">
              {formatDate(user.created_at)}
            </p>
          </div>

          {/* Email Verified */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="h-4 w-4" />
              Email Status
            </div>
            <p className="text-sm font-medium">
               <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                 user.email_confirmed_at 
                   ? 'bg-success/10 text-success border border-success/20' 
                   : 'bg-warning/10 text-warning border border-warning/20'
               }`}>
                {user.email_confirmed_at ? 'Verified' : 'Pending Verification'}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
