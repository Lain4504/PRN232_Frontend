"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  User,
  Target,
  DollarSign,
  Zap,
  RefreshCw,
  Award,
  Activity,
  MessageSquare,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useTeamAnalytics } from '@/hooks/use-analytics';
import { useAnalytics } from '@/hooks/use-analytics';
import { useExport } from '@/hooks/use-export';
import { 
  formatPercentage,
  formatCurrency,
  generateTimeRange
} from '@/lib/utils/analytics';
import { 
  DEFAULT_TIME_RANGES,
  ANALYTICS_PLATFORMS 
} from '@/lib/constants/analytics-metrics';
import { AnalyticsCharts } from './analytics-charts';
import { ExportFunctionality } from './export-functionality';
import { toast } from 'sonner';

interface TeamAnalyticsProps {
  teamId?: string;
  className?: string;
}

export function TeamAnalytics({ teamId, className }: TeamAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedTeam, setSelectedTeam] = useState(teamId || 'team-1');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRealTime, setIsRealTime] = useState(false);

  // Initialize team analytics hook
  const {
    data: teamData,
    isLoading: isLoadingTeam,
    error: teamError,
    refetch: refetchTeam,
  } = useTeamAnalytics(selectedTeam, generateTimeRange(selectedPeriod));

  // Initialize general analytics hook for comparison data
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    updateFilters,
  } = useAnalytics(
    {
      platforms: Object.values(ANALYTICS_PLATFORMS),
      metrics: ['impressions', 'clicks', 'conversions', 'ctr', 'roi'],
    },
    generateTimeRange(selectedPeriod)
  );

  // Initialize export hook
  const {
    exportData,
    isExporting,
    exportHistory,
  } = useExport();

  // Calculate team performance metrics
  const teamMetrics = useMemo(() => {
    if (!teamData) return null;

    const productivity = teamData.productivity;
    const collaboration = teamData.collaboration;
    const resourceUsage = teamData.resourceUsage;
    
    return {
      overallScore: Math.round((productivity.averageTaskCompletion + productivity.averageCampaignPerformance + productivity.contentQualityScore + productivity.collaborationScore + productivity.efficiency) / 5),
      budgetUtilization: resourceUsage.totalBudget > 0 ? (resourceUsage.usedBudget / resourceUsage.totalBudget) * 100 : 0,
      campaignSuccessRate: resourceUsage.campaigns > 0 ? (resourceUsage.activeCampaigns / resourceUsage.campaigns) * 100 : 0,
      averageMemberScore: teamData.memberPerformance.length > 0 ? 
        teamData.memberPerformance.reduce((sum, member) => sum + member.metrics.performanceScore, 0) / teamData.memberPerformance.length : 0,
    };
  }, [teamData]);

  // Get performance score color
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  // Handle team change
  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId);
  };

  // Handle real-time toggle
  const handleRealTimeToggle = (enabled: boolean) => {
    setIsRealTime(enabled);
  };

  // Handle export
  const handleExport = async (format: string) => {
    try {
      await exportData({
        reportId: `team-${selectedTeam}`,
        format: format as 'pdf' | 'csv' | 'excel' | 'json',
        options: {
          includeCharts: true,
          includeRawData: format === 'csv' || format === 'excel',
          dateRange: generateTimeRange(selectedPeriod),
          filters: {
            teamIds: [selectedTeam],
          }
        }
      });
      toast.success(`Team export started in ${format.toUpperCase()} format`);
    } catch (error) {
      toast.error('Failed to start team export');
    }
  };

  if (isLoadingTeam) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading team analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (teamError || !teamData) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 mb-2">Failed to load team analytics</p>
            <Button onClick={refetchTeam} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 space-y-6 p-6 bg-background ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Analytics</h1>
          <p className="text-muted-foreground">
            Performance insights for {teamData.teamName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleRealTimeToggle(!isRealTime)}
            className={isRealTime ? 'bg-green-50 border-green-200 text-green-700' : ''}
          >
            <Zap className="mr-2 h-4 w-4" />
            {isRealTime ? 'Real-time ON' : 'Real-time OFF'}
          </Button>
          <Button variant="outline" onClick={refetchTeam}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <ExportFunctionality
            onExport={handleExport}
            isExporting={isExporting}
            exportHistory={exportHistory}
          />
        </div>
      </div>

      {/* Team Info and Controls */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Team Members</label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">{teamData.resourceUsage.teamMembers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Overall Score</label>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${teamMetrics ? getPerformanceColor(teamMetrics.overallScore).split(' ')[0] : ''}`}>
                  {teamMetrics?.overallScore || 0}
                </div>
                <div className="text-xs text-muted-foreground">/ 100</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Active Campaigns</label>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-sm">{teamData.resourceUsage.activeCampaigns} / {teamData.resourceUsage.campaigns}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <div className="flex gap-2">
                {Object.entries(DEFAULT_TIME_RANGES).slice(0, 4).map(([key, range]) => (
                  <Button
                    key={key}
                    variant={selectedPeriod === range.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePeriodChange(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(teamData.productivity.averageTaskCompletion)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">+5.2%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Performance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(teamData.productivity.averageCampaignPerformance)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">+3.1%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Quality</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(teamData.productivity.contentQualityScore)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">+2.8%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaboration Score</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(teamData.collaboration.communicationScore)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">+4.5%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Team Performance Trends
                </CardTitle>
                <CardDescription>
                  Track team performance across key metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsCharts
                  data={analyticsData}
                  type="line"
                  metrics={['impressions', 'clicks', 'conversions']}
                  timeRange={generateTimeRange(selectedPeriod)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Utilization
                </CardTitle>
                <CardDescription>
                  Monitor team budget usage and resource allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Budget Utilization</span>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(teamMetrics?.budgetUtilization || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(teamMetrics?.budgetUtilization || 0, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Budget</div>
                      <div className="font-medium">{formatCurrency(teamData.resourceUsage.totalBudget)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Used</div>
                      <div className="font-medium">{formatCurrency(teamData.resourceUsage.usedBudget)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Member Performance
              </CardTitle>
              <CardDescription>
                Individual performance metrics for each team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamData.memberPerformance.map((member) => (
                  <div key={member.userId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{member.userName}</h4>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getPerformanceColor(member.metrics.performanceScore).split(' ')[0]}`}>
                          {member.metrics.performanceScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Tasks</div>
                        <div className="font-medium">{member.metrics.tasksCompleted}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Campaigns</div>
                        <div className="font-medium">{member.metrics.campaignsManaged}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Content</div>
                        <div className="font-medium">{member.metrics.contentCreated}</div>
                      </div>
                    </div>
                    
                    {member.achievements.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex flex-wrap gap-1">
                          {member.achievements.map((achievement, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Productivity Metrics
                </CardTitle>
                <CardDescription>
                  Key productivity indicators for the team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Task Completion Rate</span>
                    <span className="text-sm font-medium">{formatPercentage(teamData.productivity.averageTaskCompletion)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${teamData.productivity.averageTaskCompletion}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Campaign Performance</span>
                    <span className="text-sm font-medium">{formatPercentage(teamData.productivity.averageCampaignPerformance)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${teamData.productivity.averageCampaignPerformance}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Content Quality</span>
                    <span className="text-sm font-medium">{formatPercentage(teamData.productivity.contentQualityScore)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${teamData.productivity.contentQualityScore}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Efficiency Metrics
                </CardTitle>
                <CardDescription>
                  Team efficiency and resource utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatPercentage(teamData.productivity.efficiency)}</div>
                    <div className="text-sm text-green-700">Overall Efficiency</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{teamData.resourceUsage.contentPieces}</div>
                      <div className="text-xs text-blue-700">Content Pieces</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{teamData.resourceUsage.campaigns}</div>
                      <div className="text-xs text-purple-700">Total Campaigns</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Collaboration Metrics
              </CardTitle>
              <CardDescription>
                Team collaboration and communication effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Communication Score</span>
                    <span className="text-sm font-medium">{formatPercentage(teamData.collaboration.communicationScore)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${teamData.collaboration.communicationScore}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Knowledge Sharing</span>
                    <span className="text-sm font-medium">{formatPercentage(teamData.collaboration.knowledgeSharing)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${teamData.collaboration.knowledgeSharing}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{teamData.collaboration.teamMeetings}</div>
                      <div className="text-xs text-green-700">Team Meetings</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{teamData.collaboration.sharedProjects}</div>
                      <div className="text-xs text-blue-700">Shared Projects</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{teamData.collaboration.crossTeamCollaboration}</div>
                      <div className="text-xs text-purple-700">Cross-team Collab</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{teamData.collaboration.knowledgeSharing}</div>
                      <div className="text-xs text-orange-700">Knowledge Sharing</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
