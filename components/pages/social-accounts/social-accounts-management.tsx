"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertCircle, Plus } from "lucide-react";
import { useGetAccountsWithTargets } from "@/hooks/use-social-accounts";
import { SocialAccountList } from "@/components/social/social-account-list";
import { ConnectModal } from "@/components/social/connect-modal";
import { EmptyState } from "@/components/social/empty-state";
import { LoadingState } from "@/components/social/loading-state";
import { ErrorState } from "@/components/social/error-state";
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
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Skeleton className="h-10 w-64 mb-3" />
              <Skeleton className="h-5 w-80" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
          <LoadingState count={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
        <div className="flex items-center justify-center min-h-[400px]">
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
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
      {/* Header */}
      <div className="space-y-3 lg:space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
            Social Accounts
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
            Connect and manage your social media accounts to streamline your content workflow
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
            <Users className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium">{socialAccounts.length}</span>
            <span className="text-muted-foreground">Connected</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
            <span className="font-medium">{totalIntegrations}</span>
            <span className="text-muted-foreground">Integrations</span>
          </div>
        </div>
      </div>

      {/* Social Accounts List */}
      {socialAccounts.length > 0 ? (
        <>
          {/* Connect New Account - Only show when user has at least one account */}
          <Card className="border border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold">Connect New Account</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Link additional social media accounts to expand your content management capabilities.
              </p>
              <ConnectModal>
                <Button size="sm" className="w-full sm:w-auto h-8 text-xs">
                  <Plus className="mr-1 h-3 w-3" />
                  Choose Platform
                </Button>
              </ConnectModal>
            </CardContent>
          </Card>

          <div className="space-y-3 lg:space-y-4">
            <h2 className="text-lg lg:text-xl font-semibold">Connected Accounts</h2>
            <SocialAccountList 
              accounts={socialAccounts} 
              userId={user?.id || ""}
              onRefresh={handleRefresh}
            />
          </div>
        </>
      ) : (
        <EmptyState type="accounts" />
      )}

      {/* Help Section */}
      <Card className="border border-blue-200 dark:border-blue-800">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-xs mb-1">
                About Social Account Connections
              </h3>
              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                Connecting your social media accounts enables AISAM to automatically post your approved content. 
                We use secure OAuth authentication and never store your passwords. You can disconnect accounts at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
