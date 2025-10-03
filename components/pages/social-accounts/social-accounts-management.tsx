"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Share2, 
  Plus, 
  Trash2, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Settings,
  Linkedin
} from "lucide-react";
import { 
  SiFacebook, 
  SiInstagram, 
  SiX, 
  SiYoutube, 
  SiTiktok 
} from "@icons-pack/react-simple-icons";
import { authApi, socialAccountApi } from "@/lib/mock-api";
import { User, SocialAccount } from "@/lib/types/aisam-types";
import { toast } from "sonner";

export function SocialAccountsManagement() {
  const [user, setUser] = useState<User | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
          
          // Get social accounts
          const accountsResponse = await socialAccountApi.getSocialAccounts(userResponse.data.id);
          if (accountsResponse.success) {
            setSocialAccounts(accountsResponse.data);
          }
        }
      } catch (error) {
        console.error('Failed to load social accounts:', error);
        toast.error('Failed to load social accounts');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <SiFacebook className="h-5 w-5" color="#1877F2" />;
      case 'instagram':
        return <SiInstagram className="h-5 w-5" color="#E4405F" />;
      case 'twitter':
        return <SiX className="h-5 w-5" color="#000000" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5" color="#0A66C2" />;
      case 'youtube':
        return <SiYoutube className="h-5 w-5" color="#FF0000" />;
      case 'tiktok':
        return <SiTiktok className="h-5 w-5" color="#000000" />;
      default:
        return <Share2 className="h-5 w-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'text-[#1877F2]';
      case 'instagram':
        return 'text-[#E4405F]';
      case 'twitter':
        return 'text-[#1DA1F2]';
      case 'linkedin':
        return 'text-[#0A66C2]';
      case 'youtube':
        return 'text-[#FF0000]';
      case 'tiktok':
        return 'text-black';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Connected</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleConnectAccount = async (platform: string) => {
    try {
      setConnecting(platform);
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAccountData = {
        user_id: user?.id || '',
        platform: platform,
        account_id: `${platform}_${Date.now()}`,
        account_name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`,
        access_token: `mock_token_${Date.now()}`,
        status: 'active' as const
      };
      
      const response = await socialAccountApi.connectAccount(platform, mockAccountData);
      if (response.success) {
        setSocialAccounts([...socialAccounts, response.data]);
        toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected successfully!`);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to connect account:', error);
      toast.error('Failed to connect account');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account? This will stop all automated posting to this platform.')) {
      return;
    }

    try {
      const response = await socialAccountApi.disconnectAccount(accountId);
      if (response.success) {
        setSocialAccounts(socialAccounts.filter(a => a.id !== accountId));
        toast.success('Account disconnected successfully');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to disconnect account:', error);
      toast.error('Failed to disconnect account');
    }
  };

  const availablePlatforms = [
    { id: 'facebook', name: 'Facebook', description: 'Connect your Facebook page' },
    { id: 'instagram', name: 'Instagram', description: 'Connect your Instagram business account' },
    { id: 'twitter', name: 'Twitter', description: 'Connect your Twitter account' },
    { id: 'linkedin', name: 'LinkedIn', description: 'Connect your LinkedIn company page' },
    { id: 'youtube', name: 'YouTube', description: 'Connect your YouTube channel' },
    { id: 'tiktok', name: 'TikTok', description: 'Connect your TikTok business account' },
  ];

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading social accounts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Accounts</h1>
          <p className="text-muted-foreground">
            Connect and manage your social media accounts
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {socialAccounts.filter(a => a.status === 'active').length} Connected
        </Badge>
      </div>

      {/* Connected Accounts */}
      {socialAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Connected Accounts
            </CardTitle>
            <CardDescription>
              Your connected social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {socialAccounts.map((account) => (
                <Card key={account.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {getPlatformIcon(account.platform)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{account.account_name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {account.platform}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDisconnectAccount(account.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      {getStatusBadge(account.status)}
                      <div className="text-xs text-muted-foreground">
                        Connected {new Date(account.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Connect New Account
          </CardTitle>
          <CardDescription>
            Connect additional social media platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availablePlatforms.map((platform) => {
              const isConnected = socialAccounts.some(a => a.platform === platform.id && a.status === 'active');
              const isConnecting = connecting === platform.id;
              
              return (
                <Card key={platform.id} className={`hover:shadow-lg transition-shadow ${isConnected ? 'opacity-50' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-muted">
                        {getPlatformIcon(platform.id)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{platform.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {platform.description}
                        </p>
                      </div>
                    </div>
                    
                    {isConnected ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleConnectAccount(platform.id)}
                        disabled={isConnecting}
                        className="w-full"
                      >
                        {isConnecting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">About Social Account Connections</h3>
              <p className="text-sm text-muted-foreground">
                Connecting your social media accounts allows AISAM to automatically post your approved content. 
                We use secure OAuth authentication and never store your passwords. You can disconnect accounts at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
