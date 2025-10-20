'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  UserPlus, 
  UserMinus, 
  Settings, 
  FileText, 
  CreditCard,
  Shield,
  Calendar,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import { TeamActivityLog } from '@/lib/types/teams';
import { formatDate, formatRelativeTime } from '@/lib/utils/teams';

interface TeamActivityFeedProps {
  teamId: string;
  activities: TeamActivityLog[];
  canView?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export function TeamActivityFeed({ 
  teamId, 
  activities, 
  canView = true, 
  onLoadMore,
  isLoading = false 
}: TeamActivityFeedProps) {
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!canView) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You don&apos;t have permission to view team activity.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredActivities = activities.filter(activity => {
    if (activityFilter === 'all') return true;
    return activity.type === activityFilter;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_joined':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'member_left':
        return <UserMinus className="h-4 w-4 text-red-600" />;
      case 'member_role_changed':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'settings_updated':
        return <Settings className="h-4 w-4 text-purple-600" />;
      case 'content_created':
        return <FileText className="h-4 w-4 text-orange-600" />;
      case 'content_updated':
        return <FileText className="h-4 w-4 text-yellow-600" />;
      case 'content_deleted':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'billing_updated':
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'team_created':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'team_updated':
        return <Activity className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'member_joined':
        return 'bg-green-100 text-green-800';
      case 'member_left':
        return 'bg-red-100 text-red-800';
      case 'member_role_changed':
        return 'bg-blue-100 text-blue-800';
      case 'settings_updated':
        return 'bg-purple-100 text-purple-800';
      case 'content_created':
        return 'bg-orange-100 text-orange-800';
      case 'content_updated':
        return 'bg-yellow-100 text-yellow-800';
      case 'content_deleted':
        return 'bg-red-100 text-red-800';
      case 'billing_updated':
        return 'bg-green-100 text-green-800';
      case 'team_created':
        return 'bg-blue-100 text-blue-800';
      case 'team_updated':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityDescription = (activity: TeamActivityLog) => {
    switch (activity.type) {
      case 'member_joined':
        return `${activity.userEmail} joined the team`;
      case 'member_left':
        return `${activity.userEmail} left the team`;
      case 'member_role_changed':
        return `${activity.userEmail}'s role was changed to ${activity.details?.newRole || 'unknown'}`;
      case 'settings_updated':
        return `Team settings were updated by ${activity.userEmail}`;
      case 'content_created':
        return `${activity.userEmail} created new content`;
      case 'content_updated':
        return `${activity.userEmail} updated content`;
      case 'content_deleted':
        return `${activity.userEmail} deleted content`;
      case 'billing_updated':
        return `Billing information was updated by ${activity.userEmail}`;
      case 'team_created':
        return `Team was created by ${activity.userEmail}`;
      case 'team_updated':
        return `Team information was updated by ${activity.userEmail}`;
      default:
        return `${activity.userEmail} performed an action`;
    }
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
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

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'member_joined', label: 'Member Joined' },
    { value: 'member_left', label: 'Member Left' },
    { value: 'member_role_changed', label: 'Role Changes' },
    { value: 'settings_updated', label: 'Settings' },
    { value: 'content_created', label: 'Content Created' },
    { value: 'content_updated', label: 'Content Updated' },
    { value: 'billing_updated', label: 'Billing' },
    { value: 'team_created', label: 'Team Created' },
    { value: 'team_updated', label: 'Team Updated' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Activity</h2>
          <p className="text-muted-foreground">
            Monitor team activities and changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={activityFilter} onValueChange={setActivityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter activities" />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest team activities and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Activities</h3>
              <p className="text-muted-foreground">
                {activityFilter === 'all' 
                  ? 'No team activities yet.' 
                  : `No ${activityFilter.replace('_', ' ')} activities found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(activity.userEmail)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <span className="font-medium">{getActivityDescription(activity)}</span>
                      </div>
                      <Badge className={getActivityColor(activity.type)}>
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {activity.details && (
                      <div className="text-sm text-muted-foreground">
                        {Object.entries(activity.details).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(activity.timestamp)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(activity.timestamp)}</span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {activities.filter(a => a.type === 'member_joined').length}
                </div>
                <div className="text-sm text-muted-foreground">Members Joined</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {activities.filter(a => a.type === 'member_role_changed').length}
                </div>
                <div className="text-sm text-muted-foreground">Role Changes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {activities.filter(a => a.type === 'content_created').length}
                </div>
                <div className="text-sm text-muted-foreground">Content Created</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {activities.filter(a => a.type === 'settings_updated').length}
                </div>
                <div className="text-sm text-muted-foreground">Settings Updated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Load More Button */}
      {onLoadMore && (
        <div className="text-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Activities
          </Button>
        </div>
      )}
    </div>
  );
}
