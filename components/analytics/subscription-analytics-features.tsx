"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown,
  Star,
  Lock,
  Check,
  X,
  BarChart3,
} from 'lucide-react';
import { ANALYTICS_SUBSCRIPTION_TIERS, SUBSCRIPTION_LIMITS } from '@/lib/constants/analytics-metrics';
import { useSubscription } from '@/hooks/use-subscription';
import { toast } from 'sonner';

interface SubscriptionAnalyticsFeaturesProps {
  className?: string;
}

export function SubscriptionAnalyticsFeatures({ className }: SubscriptionAnalyticsFeaturesProps) {
  const [activeTab, setActiveTab] = useState('features');
  const { data: subscription, isLoading } = useSubscription();

  // Get current subscription tier
  const currentTier = subscription?.tier || 'free';
  const currentLimits = SUBSCRIPTION_LIMITS[currentTier as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.FREE;

  // Feature comparison data
  const features = useMemo(() => [
    {
      id: 'historical_data',
      name: 'Historical Data',
      description: 'Access to historical analytics data',
      tiers: {
        free: { value: '30 days', included: true },
        pro: { value: '365 days', included: true },
        enterprise: { value: 'Unlimited', included: true }
      }
    },
    {
      id: 'custom_reports',
      name: 'Custom Reports',
      description: 'Create and customize your own analytics reports',
      tiers: {
        free: { value: 'No', included: false },
        pro: { value: 'Yes', included: true },
        enterprise: { value: 'Yes', included: true }
      }
    },
    {
      id: 'export_formats',
      name: 'Export Formats',
      description: 'Available export formats for reports',
      tiers: {
        free: { value: 'PDF, CSV', included: true },
        pro: { value: 'All formats', included: true },
        enterprise: { value: 'All formats', included: true }
      }
    },
    {
      id: 'real_time_updates',
      name: 'Real-time Updates',
      description: 'Live data updates and refresh capabilities',
      tiers: {
        free: { value: 'No', included: false },
        pro: { value: 'Yes', included: true },
        enterprise: { value: 'Yes', included: true }
      }
    },
    {
      id: 'team_analytics',
      name: 'Team Analytics',
      description: 'Team performance and collaboration metrics',
      tiers: {
        free: { value: 'No', included: false },
        pro: { value: 'Yes', included: true },
        enterprise: { value: 'Yes', included: true }
      }
    },
    {
      id: 'advanced_filters',
      name: 'Advanced Filters',
      description: 'Advanced filtering and drill-down capabilities',
      tiers: {
        free: { value: 'No', included: false },
        pro: { value: 'Yes', included: true },
        enterprise: { value: 'Yes', included: true }
      }
    },
    {
      id: 'scheduled_reports',
      name: 'Scheduled Reports',
      description: 'Automated report generation and delivery',
      tiers: {
        free: { value: 'No', included: false },
        pro: { value: 'Yes', included: true },
        enterprise: { value: 'Yes', included: true }
      }
    },
    {
      id: 'white_label_reports',
      name: 'White-label Reports',
      description: 'Custom branding and white-label reports',
      tiers: {
        free: { value: 'No', included: false },
        pro: { value: 'No', included: false },
        enterprise: { value: 'Yes', included: true }
      }
    }
  ], []);

  // Get tier icon
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <BarChart3 className="h-5 w-5" />;
      case 'pro':
        return <Star className="h-5 w-5" />;
      case 'enterprise':
        return <Crown className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'pro':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'enterprise':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Check if feature is available for current tier
  const isFeatureAvailable = (featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    if (!feature) return false;
    
    return feature.tiers[currentTier as keyof typeof feature.tiers]?.included || false;
  };

  // Handle upgrade
  const handleUpgrade = (tier: string) => {
    toast.info(`Upgrade to ${tier} plan to access this feature`);
    // In a real implementation, this would redirect to billing/upgrade page
  };

  // Get usage statistics
  const usageStats = useMemo(() => {
    // Mock usage data - in real implementation, this would come from API
    return {
      reportsUsed: 3,
      exportsUsed: 8,
      teamMembers: 1,
      dataRetention: 30
    };
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTierIcon(currentTier)}
            Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
          </CardTitle>
          <CardDescription>
            Your current analytics features and limitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{usageStats.reportsUsed}</div>
              <div className="text-sm text-muted-foreground">Reports Used</div>
              <div className="text-xs text-muted-foreground">
                / {currentLimits.maxReports === -1 ? '∞' : currentLimits.maxReports}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{usageStats.exportsUsed}</div>
              <div className="text-sm text-muted-foreground">Exports Used</div>
              <div className="text-xs text-muted-foreground">
                / {currentLimits.maxExports === -1 ? '∞' : currentLimits.maxExports}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{usageStats.teamMembers}</div>
              <div className="text-sm text-muted-foreground">Team Members</div>
              <div className="text-xs text-muted-foreground">
                / {currentLimits.maxTeamMembers === -1 ? '∞' : currentLimits.maxTeamMembers}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{usageStats.dataRetention}</div>
              <div className="text-sm text-muted-foreground">Data Retention (days)</div>
              <div className="text-xs text-muted-foreground">
                / {currentLimits.dataRetention === -1 ? '∞' : currentLimits.dataRetention}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="comparison">Plan Comparison</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.id} className={isFeatureAvailable(feature.id) ? '' : 'opacity-60'}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm">{feature.name}</h4>
                        {isFeatureAvailable(feature.id) ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{feature.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isFeatureAvailable(feature.id) ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {feature.tiers[currentTier as keyof typeof feature.tiers]?.value}
                        </Badge>
                        {!isFeatureAvailable(feature.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpgrade('pro')}
                            className="h-6 px-2 text-xs"
                          >
                            Upgrade
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Comparison</CardTitle>
              <CardDescription>
                Compare features across different subscription tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Feature</th>
                      {Object.values(ANALYTICS_SUBSCRIPTION_TIERS).map(tier => (
                        <th key={tier} className="text-center p-3 font-medium">
                          <div className="flex items-center justify-center gap-2">
                            {getTierIcon(tier)}
                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature) => (
                      <tr key={feature.id} className="border-b">
                        <td className="p-3">
                          <div>
                            <div className="font-medium text-sm">{feature.name}</div>
                            <div className="text-xs text-muted-foreground">{feature.description}</div>
                          </div>
                        </td>
                        {Object.values(ANALYTICS_SUBSCRIPTION_TIERS).map(tier => {
                          const tierFeature = feature.tiers[tier as keyof typeof feature.tiers];
                          return (
                            <td key={tier} className="text-center p-3">
                              {tierFeature?.included ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Check className="h-4 w-4 text-green-600" />
                                  <span className="text-sm">{tierFeature.value}</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <X className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-muted-foreground">{tierFeature?.value}</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {Object.values(ANALYTICS_SUBSCRIPTION_TIERS).map(tier => {
              const limits = SUBSCRIPTION_LIMITS[tier as keyof typeof SUBSCRIPTION_LIMITS];
              const isCurrentTier = tier === currentTier;
              
              return (
                <Card key={tier} className={isCurrentTier ? 'ring-2 ring-primary' : ''}>
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getTierIcon(tier)}
                      <CardTitle className="text-lg">{tier.charAt(0).toUpperCase() + tier.slice(1)}</CardTitle>
                    </div>
                    <CardDescription>
                      {tier === 'free' && 'Basic analytics features'}
                      {tier === 'pro' && 'Advanced analytics with team features'}
                      {tier === 'enterprise' && 'Full analytics suite with white-label'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {tier === 'free' && 'Free'}
                        {tier === 'pro' && '$29'}
                        {tier === 'enterprise' && 'Custom'}
                      </div>
                      {tier !== 'free' && (
                        <div className="text-sm text-muted-foreground">per month</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{limits.historicalData === -1 ? 'Unlimited' : `${limits.historicalData} days`} historical data</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{limits.maxReports === -1 ? 'Unlimited' : limits.maxReports} reports</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{limits.maxExports === -1 ? 'Unlimited' : limits.maxExports} exports</span>
                      </div>
                      {limits.teamAnalytics && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>Team analytics</span>
                        </div>
                      )}
                      {limits.realTimeUpdates && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>Real-time updates</span>
                        </div>
                      )}
                      {limits.whiteLabelReports && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>White-label reports</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant={isCurrentTier ? "outline" : "default"}
                      disabled={isCurrentTier}
                      onClick={() => handleUpgrade(tier)}
                    >
                      {isCurrentTier ? 'Current Plan' : `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
