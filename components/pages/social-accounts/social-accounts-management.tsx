"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertCircle, Plus } from "lucide-react";
import { useGetAccountsWithTargets } from "@/hooks/use-social-accounts";
import { SocialAccountList } from "@/components/social/social-account-list";
import { ConnectModal } from "@/components/social/connect-modal";
import { EmptyState } from "@/components/social/empty-state";
import { LoadingState } from "@/components/social/loading-state";
import { ErrorState } from "@/components/social/error-state";
import { toast } from "sonner";
import { useAuth } from "@/lib/contexts/auth-context";

export function SocialAccountsManagement() {
  const { user, isLoading: userLoading } = useAuth();
  const { data: accountsWithTargets = [], isLoading, error, refetch } = useGetAccountsWithTargets();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading || userLoading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden font-fira-sans">
        <div className="space-y-10 p-6 lg:p-10 bg-background">
          <Skeleton className="h-4 w-48 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-64 mb-3" />
            <Skeleton className="h-6 w-96 mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-[2rem]" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-10 bg-background font-fira-sans">
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
          <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <ErrorState
            title="Integrations Fault"
            message="Structural failure in communication nodes. Please re-synchronize the integration matrix."
            onRetry={handleRefresh}
          />
        </div>
      </div>
    );
  }

  const socialAccounts = accountsWithTargets.map(item => item.socialAccount);
  const totalIntegrations = accountsWithTargets.reduce((sum, item) => sum + item.targets.length, 0);

  return (
    <div className="max-w-[1440px] mx-auto font-fira-sans">
      <div className="space-y-8 p-6 lg:p-10 bg-background min-h-screen">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Social Accounts
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Manage your connected social media accounts and integrations.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Connected</p>
              <p className="text-2xl font-bold">{socialAccounts.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Security</p>
              <p className="text-2xl font-bold text-primary">Secured</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Active Integrations</h2>
            <ConnectModal>
              <Button className="rounded-lg h-10 px-6 font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                Connect Account
              </Button>
            </ConnectModal>
          </div>

          {socialAccounts.length > 0 ? (
            <Card className="rounded-xl border shadow-sm overflow-hidden">
              <div className="p-1">
                <SocialAccountList
                  accounts={socialAccounts}
                  userId={user?.id || ""}
                  onRefresh={handleRefresh}
                />
              </div>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed rounded-xl bg-muted/5">
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center mb-6 text-muted-foreground">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No accounts connected</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Connect your first social media account to start managing your presence.
                </p>
              </div>
              <div className="mt-8">
                <ConnectModal>
                  <Button className="rounded-lg h-10 px-8 font-semibold">
                    <Plus className="mr-2 h-4 w-4" />
                    Connect First Account
                  </Button>
                </ConnectModal>
              </div>
            </div>
          )}

          {/* Security Info */}
          <Card className="border p-6 rounded-xl shadow-sm bg-primary/5 border-primary/10">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Security Protocol</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl font-medium">
                  We use industry-standard OAuth authentication to bridge your accounts.
                  Your credentials are never stored directly and remain decentralized.
                  You can terminate any integration instantly from this dashboard.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
