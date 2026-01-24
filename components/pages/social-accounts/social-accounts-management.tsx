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
      <div className="w-full max-w-full overflow-x-hidden font-fira-sans">
        <div className="space-y-10 p-6 lg:p-10 bg-background">
          <Skeleton className="h-4 w-48 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-64 mb-3" />
            <Skeleton className="h-6 w-96 mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-[2.5rem]" />)}
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
      <div className="space-y-12 p-6 lg:p-10 bg-background">

        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">External Link Protocols</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
              Social <span className="text-primary italic">Sync</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl tracking-tight leading-relaxed">
              Authenticate and coordinate your external communications. Bridge your creative output directly to the global social matrix.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-8 py-5 bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border/40 shadow-xl flex items-center gap-10">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Active Flows</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-foreground">{socialAccounts.length}</div>
              </div>
              <div className="h-10 w-px bg-border/20" />
              <div className="space-y-1">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Status</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-primary uppercase leading-none italic">SECURED</div>
              </div>
            </div>
          </div>
        </div>

        {/* Command Matrix Grid */}
        <div className="grid lg:grid-cols-12 gap-10">

          {/* Main Account Interface */}
          <div className="lg:col-span-12 space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
              <div className="flex items-center gap-4">
                <div className="h-5 w-1 bg-primary rounded-full" />
                <h2 className="text-xl font-black uppercase tracking-tight">Active Integrations</h2>
              </div>
              <ConnectModal>
                <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/40 group overflow-hidden relative transition-all hover:scale-[1.05]">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Plus className="mr-3 h-5 w-5 stroke-[3]" />
                  Integrate New Node
                </Button>
              </ConnectModal>
            </div>

            {socialAccounts.length > 0 ? (
              <div className="bg-card/20 backdrop-blur-3xl rounded-[3rem] border border-border/40 p-2 shadow-2xl">
                <SocialAccountList
                  accounts={socialAccounts}
                  userId={user?.id || ""}
                  onRefresh={handleRefresh}
                />
              </div>
            ) : (
              <div className="py-32 bg-card/20 backdrop-blur-sm border-4 border-dashed border-border/40 rounded-[4rem] text-center space-y-10 group">
                <div className="mx-auto h-32 w-32 rounded-[3.5rem] bg-muted/20 flex items-center justify-center border-2 border-transparent group-hover:border-primary/20 transition-all duration-700">
                  <Users className="h-16 w-16 text-muted-foreground stroke-[1]" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-4xl font-black uppercase tracking-tight">Connection Void</h3>
                  <p className="text-muted-foreground font-medium max-w-sm mx-auto tracking-tight leading-relaxed text-lg">
                    No biometric or social links detected in the current sector. Secure a new connection to enable automated deployment.
                  </p>
                </div>
                <ConnectModal>
                  <Button className="h-16 px-12 rounded-3xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/40 transition-all hover:scale-110">
                    <Plus className="mr-4 h-6 w-6 stroke-[3]" />
                    Initialize Sync
                  </Button>
                </ConnectModal>
              </div>
            )}
          </div>

          {/* Infrastructure Insight Section */}
          <div className="lg:col-span-12">
            <Card className="bg-primary/5 border-primary/20 rounded-[3rem] overflow-hidden group">
              <CardContent className="p-10 flex flex-col md:flex-row items-center gap-10">
                <div className="h-20 w-20 rounded-[2rem] bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-2xl shadow-primary/30">
                  <AlertCircle className="h-10 w-10 stroke-[2.5]" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Security & Encryption Protocol</h3>
                  <p className="text-muted-foreground font-medium text-lg leading-relaxed tracking-tight max-w-4xl">
                    AISAM bridges your social output using multi-layered <span className="text-primary font-black uppercase">OAuth Core</span> authentication.
                    Communication credentials remain decentralized and encrypted. Your local control allows for immediate node termination at any timestamp.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
