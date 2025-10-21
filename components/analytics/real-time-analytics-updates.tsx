"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Zap,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  Bell,
  BellOff
} from 'lucide-react';
import { RealTimeUpdate } from '@/lib/types/analytics';
import { useAnalytics } from '@/hooks/use-analytics';
import { toast } from 'sonner';

interface RealTimeAnalyticsUpdatesProps {
  className?: string;
}

export function RealTimeAnalyticsUpdates({ className }: RealTimeAnalyticsUpdatesProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [notifications, setNotifications] = useState<RealTimeUpdate[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(30000); // 30 seconds

  const { toggleRealTime, isRealTime, refresh } = useAnalytics();

  // Mock WebSocket connection (in real implementation, this would be actual WebSocket)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let wsInterval: NodeJS.Timeout;

    if (isEnabled) {
      // Simulate WebSocket connection
      setIsConnected(true);
      
      // Simulate real-time updates
      wsInterval = setInterval(() => {
        const update: RealTimeUpdate = {
          id: `update-${Date.now()}`,
          type: 'metric',
          data: {
            metric: 'impressions',
            value: Math.floor(Math.random() * 1000) + 500,
            change: Math.floor(Math.random() * 20) - 10,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
          source: 'analytics-api'
        };

        setNotifications(prev => [update, ...prev.slice(0, 9)]); // Keep last 10
        setUpdateCount(prev => prev + 1);
        setLastUpdate(new Date());

        // Show toast for significant changes
        if (Math.abs(update.data.change) > 15) {
          toast.info(`Real-time update: ${update.data.metric} ${update.data.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(update.data.change)}%`);
        }
      }, updateInterval);

      // Auto-refresh analytics data
      interval = setInterval(() => {
        refresh();
      }, updateInterval);
    } else {
      setIsConnected(false);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (wsInterval) clearInterval(wsInterval);
    };
  }, [isEnabled, updateInterval, refresh]);

  // Handle real-time toggle
  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    toggleRealTime(enabled, updateInterval);
    
    if (enabled) {
      toast.success('Real-time updates enabled');
    } else {
      toast.info('Real-time updates disabled');
    }
  };

  // Handle manual refresh
  const handleManualRefresh = () => {
    refresh();
    setLastUpdate(new Date());
    toast.success('Data refreshed manually');
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
    setUpdateCount(0);
  };

  // Get update type icon
  const getUpdateTypeIcon = (type: string) => {
    switch (type) {
      case 'metric':
        return <TrendingUp className="h-4 w-4" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4" />;
      case 'insight':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Get update type color
  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'metric':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'alert':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'insight':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Real-time Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <CardTitle className="text-sm font-medium">Real-time Updates</CardTitle>
              <Badge 
                variant={isConnected ? "default" : "secondary"}
                className="text-xs"
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Disconnected
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={false} // In real implementation, check subscription
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualRefresh}
                disabled={!isEnabled}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            {isEnabled 
              ? `Updates every ${updateInterval / 1000} seconds • ${updateCount} updates received`
              : 'Enable real-time updates to receive live data'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {isEnabled && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{updateCount}</div>
                <div className="text-xs text-green-700">Updates Received</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {lastUpdate ? formatTimeAgo(lastUpdate) : 'Never'}
                </div>
                <div className="text-xs text-blue-700">Last Update</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {updateInterval / 1000}s
                </div>
                <div className="text-xs text-purple-700">Update Interval</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Notifications */}
      {isEnabled && showNotifications && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">Live Updates</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {notifications.length}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  disabled={notifications.length === 0}
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  {showNotifications ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <CardDescription className="text-xs">
              Real-time notifications and data updates
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No updates yet</p>
                <p className="text-xs">Updates will appear here as they come in</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-lg border text-sm ${getUpdateTypeColor(notification.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {getUpdateTypeIcon(notification.type)}
                        <div className="flex-1">
                          <div className="font-medium">
                            {notification.type === 'metric' && 'Metric Update'}
                            {notification.type === 'alert' && 'Alert'}
                            {notification.type === 'insight' && 'New Insight'}
                          </div>
                          <div className="text-xs mt-1">
                            {notification.type === 'metric' && (
                              <>
                                {notification.data.metric}: {notification.data.value.toLocaleString()}
                                {notification.data.change !== 0 && (
                                  <span className={`ml-2 ${
                                    notification.data.change > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {notification.data.change > 0 ? (
                                      <TrendingUp className="h-3 w-3 inline mr-1" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3 inline mr-1" />
                                    )}
                                    {Math.abs(notification.data.change)}%
                                  </span>
                                )}
                              </>
                            )}
                            {notification.type === 'alert' && notification.data.message}
                            {notification.type === 'insight' && notification.data.title}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground ml-2">
                        {formatTimeAgo(new Date(notification.timestamp))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Connection Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Update Frequency</div>
              <div className="text-xs text-muted-foreground">How often to check for updates</div>
            </div>
            <select
              value={updateInterval}
              onChange={(e) => setUpdateInterval(Number(e.target.value))}
              className="px-3 py-1 border rounded text-sm"
              disabled={!isEnabled}
            >
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Auto-refresh Data</div>
              <div className="text-xs text-muted-foreground">Automatically refresh analytics data</div>
            </div>
            <div className="flex items-center gap-2">
              {isEnabled ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-xs text-muted-foreground">
                {isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
