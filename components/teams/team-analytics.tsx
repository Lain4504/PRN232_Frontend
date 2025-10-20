'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Calendar, 
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Shield
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils/teams';
import { TeamActivityAction } from '@/lib/types/teams';

interface TeamAnalyticsProps {
  teamId: string;
  canView?: boolean;
}

// Mock data - replace with actual API calls
const mockAnalytics = {
  totalMembers: 12,
  activeMembers: 10,
  pendingInvitations: 2,
  recentActivity: [
    {
      id: '1',
      teamId: 'team-1',
      userId: 'user-1',
      action: 'member_added' as TeamActivityAction,
      details: { email: 'john.doe@example.com', role: 'Copywriter' },
      timestamp: '2024-12-19T10:30:00Z'
    },
    {
      id: '2',
      teamId: 'team-1',
      userId: 'user-2',
      action: 'member_role_changed' as TeamActivityAction,
      details: { email: 'jane.smith@example.com', oldRole: 'Member', newRole: 'Team Leader' },
      timestamp: '2024-12-19T09:15:00Z'
    },
    {
      id: '3',
      teamId: 'team-1',
      userId: 'user-1',
      action: 'invitation_sent' as TeamActivityAction,
      details: { email: 'mike.johnson@example.com', role: 'Designer' },
      timestamp: '2024-12-18T16:45:00Z'
    }
  ],
  memberGrowth: [
    { date: '2024-11-01', count: 8 },
    { date: '2024-11-15', count: 9 },
    { date: '2024-12-01', count: 10 },
    { date: '2024-12-15', count: 11 },
    { date: '2024-12-19', count: 12 }
  ],
  roleDistribution: [
    { role: 'Copywriter', count: 4 },
    { role: 'Designer', count: 3 },
    { role: 'Marketer', count: 2 },
    { role: 'Team Leader', count: 2 },
    { role: 'Vendor', count: 1 }
  ],
  activitySummary: [
    { action: 'member_added' as TeamActivityAction, count: 5 },
    { action: 'member_role_changed' as TeamActivityAction, count: 3 },
    { action: 'invitation_sent' as TeamActivityAction, count: 8 },
    { action: 'settings_changed' as TeamActivityAction, count: 2 }
  ]
};

export function TeamAnalytics({ teamId, canView = true }: TeamAnalyticsProps) {
  const [analytics] = useState(mockAnalytics);
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!canView) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don&apos;t have permission to view team analytics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement actual export functionality
    console.log('Exporting analytics data...');
  };

  const getActivityActionLabel = (action: TeamActivityAction): string => {
    switch (action) {
      case 'member_added':
        return 'Member Added';
      case 'member_removed':
        return 'Member Removed';
      case 'member_role_changed':
        return 'Role Changed';
      case 'member_permissions_changed':
        return 'Permissions Changed';
      case 'team_created':
        return 'Team Created';
      case 'team_updated':
        return 'Team Updated';
      case 'team_deleted':
        return 'Team Deleted';
      case 'invitation_sent':
        return 'Invitation Sent';
      case 'invitation_accepted':
        return 'Invitation Accepted';
      case 'invitation_rejected':
        return 'Invitation Rejected';
      case 'billing_updated':
        return 'Billing Updated';
      case 'settings_changed':
        return 'Settings Changed';
      default:
        return 'Unknown Action';
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'Copywriter': 'bg-blue-500',
      'Designer': 'bg-green-500',
      'Marketer': 'bg-purple-500',
      'Team Leader': 'bg-orange-500',
      'Vendor': 'bg-red-500',
      'Member': 'bg-gray-500'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Analytics</h2>
          <p className="text-muted-foreground">
            Insights and metrics about your team&apos;s activity
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
              <SelectItem value="1y">Last year</SelectItem>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analytics.activeMembers / analytics.totalMembers) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingInvitations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.activitySummary.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Member Growth
            </CardTitle>
            <CardDescription>
              Team size over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.memberGrowth.map((point, index) => {
                const maxCount = Math.max(...analytics.memberGrowth.map(p => p.count));
                const height = (point.count / maxCount) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className="bg-primary rounded-t w-full transition-all duration-300 hover:bg-primary/80"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      <div>{point.count}</div>
                      <div className="mt-1">{formatDate(point.date)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Role Distribution
            </CardTitle>
            <CardDescription>
              Team members by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.roleDistribution.map((item, index) => {
                const percentage = (item.count / analytics.totalMembers) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getRoleColor(item.role)}`} />
                        <span className="text-sm font-medium">{item.role}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.count} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getRoleColor(item.role)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Summary
          </CardTitle>
          <CardDescription>
            Most common team activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.activitySummary.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="text-sm font-medium">
                    {getActivityActionLabel(item.action)}
                  </div>
                  <div className="text-2xl font-bold">{item.count}</div>
                </div>
                <Badge variant="outline">
                  {item.count} times
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest team activities and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    {getActivityActionLabel(activity.action)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {JSON.stringify(activity.details)}
                  </div>
                </div>
                <div className="flex-shrink-0 text-sm text-muted-foreground">
                  {formatRelativeTime(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
