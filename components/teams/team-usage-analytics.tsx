'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Users, 
  HardDrive, 
  Activity, 
  Zap,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { TeamBilling } from '@/lib/types/teams';

interface TeamUsageAnalyticsProps {
  teamId: string;
  billing: TeamBilling;
  canView?: boolean;
}

// Mock data - replace with actual API calls
const mockUsageHistory = [
  { date: '2024-12-01', members: 8, storage: 2048, apiCalls: 15420, contentGenerations: 89 },
  { date: '2024-12-02', members: 8, storage: 2156, apiCalls: 16230, contentGenerations: 95 },
  { date: '2024-12-03', members: 9, storage: 2234, apiCalls: 17890, contentGenerations: 102 },
  { date: '2024-12-04', members: 9, storage: 2345, apiCalls: 19200, contentGenerations: 115 },
  { date: '2024-12-05', members: 10, storage: 2456, apiCalls: 20100, contentGenerations: 128 },
  { date: '2024-12-06', members: 10, storage: 2567, apiCalls: 21800, contentGenerations: 142 },
  { date: '2024-12-07', members: 11, storage: 2678, apiCalls: 23500, contentGenerations: 156 }
];

const mockUsageForecast = [
  { date: '2024-12-08', members: 12, storage: 2800, apiCalls: 25000, contentGenerations: 170 },
  { date: '2024-12-09', members: 12, storage: 2900, apiCalls: 26500, contentGenerations: 185 },
  { date: '2024-12-10', members: 13, storage: 3000, apiCalls: 28000, contentGenerations: 200 }
];

export function TeamUsageAnalytics({ teamId, billing, canView = true }: TeamUsageAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!canView) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don&apos;t have permission to view usage analytics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return { status: 'Critical', color: 'text-red-600' };
    if (percentage >= 75) return { status: 'Warning', color: 'text-yellow-600' };
    return { status: 'Good', color: 'text-green-600' };
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement actual export functionality
    console.log('Exporting usage analytics...');
  };

  const currentUsage = billing.usage;
  const limits = billing.limits;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usage Analytics</h2>
          <p className="text-muted-foreground">
            Monitor your team&apos;s resource usage and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Current Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentUsage.members}</span>
                <span className="text-muted-foreground">
                  {limits.maxMembers === -1 ? '∞' : limits.maxMembers}
                </span>
              </div>
              {limits.maxMembers !== -1 && (
                <Progress 
                  value={getUsagePercentage(currentUsage.members, limits.maxMembers)} 
                  className="h-2"
                />
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Usage</span>
                <span className={`text-xs font-medium ${getUsageStatus(getUsagePercentage(currentUsage.members, limits.maxMembers)).color}`}>
                  {getUsageStatus(getUsagePercentage(currentUsage.members, limits.maxMembers)).status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{(currentUsage.storage / 1024).toFixed(1)} GB</span>
                <span className="text-muted-foreground">
                  {limits.maxStorage === -1 ? '∞' : `${(limits.maxStorage / 1024).toFixed(0)} GB`}
                </span>
              </div>
              {limits.maxStorage !== -1 && (
                <Progress 
                  value={getUsagePercentage(currentUsage.storage, limits.maxStorage)} 
                  className="h-2"
                />
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Usage</span>
                <span className={`text-xs font-medium ${getUsageStatus(getUsagePercentage(currentUsage.storage, limits.maxStorage)).color}`}>
                  {getUsageStatus(getUsagePercentage(currentUsage.storage, limits.maxStorage)).status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Calls */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentUsage.apiCalls.toLocaleString()}</span>
                <span className="text-muted-foreground">
                  {limits.maxApiCalls === -1 ? '∞' : limits.maxApiCalls.toLocaleString()}
                </span>
              </div>
              {limits.maxApiCalls !== -1 && (
                <Progress 
                  value={getUsagePercentage(currentUsage.apiCalls, limits.maxApiCalls)} 
                  className="h-2"
                />
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Usage</span>
                <span className={`text-xs font-medium ${getUsageStatus(getUsagePercentage(currentUsage.apiCalls, limits.maxApiCalls)).color}`}>
                  {getUsageStatus(getUsagePercentage(currentUsage.apiCalls, limits.maxApiCalls)).status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Generations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentUsage.contentGenerations}</span>
                <span className="text-muted-foreground">
                  {limits.maxContentGenerations === -1 ? '∞' : limits.maxContentGenerations}
                </span>
              </div>
              {limits.maxContentGenerations !== -1 && (
                <Progress 
                  value={getUsagePercentage(currentUsage.contentGenerations, limits.maxContentGenerations)} 
                  className="h-2"
                />
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Usage</span>
                <span className={`text-xs font-medium ${getUsageStatus(getUsagePercentage(currentUsage.contentGenerations, limits.maxContentGenerations)).color}`}>
                  {getUsageStatus(getUsagePercentage(currentUsage.contentGenerations, limits.maxContentGenerations)).status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage History Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Usage Trends
            </CardTitle>
            <CardDescription>
              Resource usage over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {mockUsageHistory.map((day, index) => {
                const maxMembers = Math.max(...mockUsageHistory.map(d => d.members));
                const height = (day.members / maxMembers) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className="bg-primary rounded-t w-full transition-all duration-300 hover:bg-primary/80"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      <div>{day.members}</div>
                      <div className="mt-1">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Usage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Usage Distribution
            </CardTitle>
            <CardDescription>
              Current resource allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">Team Members</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentUsage.members} / {limits.maxMembers === -1 ? '∞' : limits.maxMembers}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${getUsagePercentage(currentUsage.members, limits.maxMembers)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Storage</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(currentUsage.storage / 1024).toFixed(1)} GB / {limits.maxStorage === -1 ? '∞' : `${(limits.maxStorage / 1024).toFixed(0)} GB`}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${getUsagePercentage(currentUsage.storage, limits.maxStorage)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm font-medium">API Calls</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentUsage.apiCalls.toLocaleString()} / {limits.maxApiCalls === -1 ? '∞' : limits.maxApiCalls.toLocaleString()}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-purple-500"
                    style={{ width: `${getUsagePercentage(currentUsage.apiCalls, limits.maxApiCalls)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium">AI Generations</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentUsage.contentGenerations} / {limits.maxContentGenerations === -1 ? '∞' : limits.maxContentGenerations}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-yellow-500"
                    style={{ width: `${getUsagePercentage(currentUsage.contentGenerations, limits.maxContentGenerations)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Forecast
          </CardTitle>
          <CardDescription>
            Predicted usage based on current trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockUsageForecast.map((forecast, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{new Date(forecast.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</div>
                    <div className="text-sm text-muted-foreground">Predicted usage</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-medium">{forecast.members}</div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{(forecast.storage / 1024).toFixed(1)} GB</div>
                    <div className="text-xs text-muted-foreground">Storage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{forecast.apiCalls.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">API Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{forecast.contentGenerations}</div>
                    <div className="text-xs text-muted-foreground">Generations</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Alerts */}
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Usage Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getUsagePercentage(currentUsage.members, limits.maxMembers) >= 75 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800">Member Limit Warning</div>
                  <div className="text-sm text-yellow-700">
                    You&apos;re using {Math.round(getUsagePercentage(currentUsage.members, limits.maxMembers))}% of your member limit.
                  </div>
                </div>
              </div>
            )}
            
            {getUsagePercentage(currentUsage.apiCalls, limits.maxApiCalls) >= 75 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800">API Usage Warning</div>
                  <div className="text-sm text-yellow-700">
                    You&apos;re using {Math.round(getUsagePercentage(currentUsage.apiCalls, limits.maxApiCalls))}% of your API call limit.
                  </div>
                </div>
              </div>
            )}

            {getUsagePercentage(currentUsage.members, limits.maxMembers) < 75 && 
             getUsagePercentage(currentUsage.apiCalls, limits.maxApiCalls) < 75 && (
              <div className="flex items-center gap-3 p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">All Good</div>
                  <div className="text-sm text-green-700">
                    Your usage is within normal limits.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
