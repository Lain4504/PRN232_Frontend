"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertCircle } from "lucide-react";
import { useGetAccountsWithTargets } from "@/hooks/use-social-accounts";
import { SocialAccountList } from "@/components/social/SocialAccountList";
import { ConnectModal } from "@/components/social/ConnectModal";
import { EmptyState } from "@/components/social/EmptyState";
import { LoadingState } from "@/components/social/LoadingState";
import { ErrorState } from "@/components/social/ErrorState";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export function SocialAccountsManagement() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const { data: accountsWithTargets = [], isLoading, error, refetch } = useGetAccountsWithTargets();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
        toast.error('Failed to get user information');
      } finally {
        setUserLoading(false);
      }
    };

    getUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setUserLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading || userLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
          <LoadingState count={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <ErrorState
            title="Failed to load social accounts"
            message="There was an error loading your social accounts. Please try again."
            onRetry={handleRefresh}
          />
        </div>
      </div>
    );
  }

  const socialAccounts = accountsWithTargets.map(item => item.socialAccount);
  const totalIntegrations = accountsWithTargets.reduce((sum, item) => sum + item.targets.length, 0);

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Accounts</h1>
          <p className="text-muted-foreground">
            Connect and manage your social media accounts and integrations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            <Users className="mr-2 h-4 w-4" />
            {socialAccounts.length} Accounts
          </Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {totalIntegrations} Integrations
          </Badge>
        </div>
      </div>

      {/* Connect New Account */}
      <Card>
        <CardHeader>
          <CardTitle>Connect New Account</CardTitle>
          <CardDescription>
            Link your social media accounts to start managing content and campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectModal />
        </CardContent>
      </Card>

      {/* Social Accounts List */}
      {socialAccounts.length > 0 ? (
        <SocialAccountList 
          accounts={socialAccounts} 
          userId={user?.id || ""}
          onRefresh={handleRefresh}
        />
      ) : (
        <EmptyState onConnect={() => {}} type="accounts" />
      )}

      {/* Help Text */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-chart-1 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">About Social Account Connections</h3>
              <p className="text-sm text-muted-foreground">
                Connecting your social media accounts allows AISAM to automatically post your approved content. 
                We use secure OAuth authentication and never store your passwords. You can disconnect accounts at any time.
                After connecting, link your pages to brands to create integrations for content management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
