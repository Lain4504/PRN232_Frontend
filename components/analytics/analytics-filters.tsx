"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  X, 
  Search,
  Target,
  Globe,
  Users,
  BarChart3,
  Settings,
  RotateCcw
} from 'lucide-react';
import { 
  SiFacebook, 
  SiInstagram, 
  SiX, 
  SiYoutube, 
  SiTiktok,
  SiLinkedin,
  SiPinterest
} from '@icons-pack/react-simple-icons';
import { AnalyticsFilters as AnalyticsFiltersType } from '@/lib/types/analytics';
import { 
  ANALYTICS_PLATFORMS,
  ANALYTICS_METRICS,
  ANALYTICS_DIMENSIONS
} from '@/lib/constants/analytics-metrics';

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersType;
  onFiltersChange: (filters: AnalyticsFiltersType) => void;
  onClearFilters: () => void;
  className?: string;
}

export function AnalyticsFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  className 
}: AnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Platform icons mapping
  const platformIcons = {
    facebook: <SiFacebook className="h-4 w-4" color="#1877F2" />,
    instagram: <SiInstagram className="h-4 w-4" color="#E4405F" />,
    twitter: <SiX className="h-4 w-4" color="#000000" />,
    youtube: <SiYoutube className="h-4 w-4" color="#FF0000" />,
    tiktok: <SiTiktok className="h-4 w-4" color="#000000" />,
    linkedin: <SiLinkedin className="h-4 w-4" color="#0077B5" />,
    pinterest: <SiPinterest className="h-4 w-4" color="#E60023" />,
  };

  // Filtered metrics based on search
  const filteredMetrics = useMemo(() => {
    if (!searchTerm) return Object.values(ANALYTICS_METRICS);
    return Object.values(ANALYTICS_METRICS).filter(metric =>
      metric.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Handle platform selection
  const handlePlatformToggle = (platform: string) => {
    const currentPlatforms = filters.platforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];
    
    onFiltersChange({
      ...filters,
      platforms: newPlatforms.length > 0 ? newPlatforms : undefined
    });
  };

  // Handle metric selection
  const handleMetricToggle = (metric: string) => {
    const currentMetrics = filters.metrics || [];
    const newMetrics = currentMetrics.includes(metric)
      ? currentMetrics.filter(m => m !== metric)
      : [...currentMetrics, metric];
    
    onFiltersChange({
      ...filters,
      metrics: newMetrics.length > 0 ? newMetrics : undefined
    });
  };

  // Handle campaign filter
  // const handleCampaignFilter = (campaignIds: string[]) => {
  //   onFiltersChange({
  //     ...filters,
  //     campaignIds: campaignIds.length > 0 ? campaignIds : undefined
  //   });
  // };

  // Handle content filter
  // const handleContentFilter = (contentIds: string[]) => {
  //   onFiltersChange({
  //     ...filters,
  //     contentIds: contentIds.length > 0 ? contentIds : undefined
  //   });
  // };

  // Handle team filter
  // const handleTeamFilter = (teamIds: string[]) => {
  //   onFiltersChange({
  //     ...filters,
  //     teamIds: teamIds.length > 0 ? teamIds : undefined
  //   });
  // };

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.platforms && filters.platforms.length > 0) count++;
    if (filters.metrics && filters.metrics.length > 0) count++;
    if (filters.campaignIds && filters.campaignIds.length > 0) count++;
    if (filters.contentIds && filters.contentIds.length > 0) count++;
    if (filters.teamIds && filters.teamIds.length > 0) count++;
    if (filters.dateRange) count++;
    return count;
  }, [filters]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-6 px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs">
          Filter your analytics data by platform, metrics, and other dimensions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Platform Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-2">
            <Globe className="h-3 w-3" />
            Platforms
          </Label>
          <div className="flex flex-wrap gap-2">
            {Object.values(ANALYTICS_PLATFORMS).map(platform => (
              <Button
                key={platform}
                variant={filters.platforms?.includes(platform) ? "default" : "outline"}
                size="sm"
                onClick={() => handlePlatformToggle(platform)}
                className="h-7 px-2 text-xs"
              >
                {platformIcons[platform as keyof typeof platformIcons]}
                <span className="ml-1 capitalize">{platform}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Metrics Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-2">
            <BarChart3 className="h-3 w-3" />
            Metrics
          </Label>
          
          {/* Search for metrics */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-7 pl-7 text-xs"
            />
          </div>

          {/* Metrics checkboxes */}
          <div className="max-h-32 overflow-y-auto space-y-2">
            {filteredMetrics.map(metric => (
              <div key={metric} className="flex items-center space-x-2">
                <Checkbox
                  id={metric}
                  checked={filters.metrics?.includes(metric) || false}
                  onCheckedChange={() => handleMetricToggle(metric)}
                  className="h-3 w-3"
                />
                <Label
                  htmlFor={metric}
                  className="text-xs font-normal cursor-pointer flex-1"
                >
                  {metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {isExpanded && (
          <>
            <Separator />
            
            {/* Campaign Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Target className="h-3 w-3" />
                Campaigns
              </Label>
              <Select>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select campaigns..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="campaign-1">Campaign 1</SelectItem>
                  <SelectItem value="campaign-2">Campaign 2</SelectItem>
                  <SelectItem value="campaign-3">Campaign 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <BarChart3 className="h-3 w-3" />
                Content
              </Label>
              <Select>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select content..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  <SelectItem value="content-1">Content 1</SelectItem>
                  <SelectItem value="content-2">Content 2</SelectItem>
                  <SelectItem value="content-3">Content 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Team Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Users className="h-3 w-3" />
                Teams
              </Label>
              <Select>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select teams..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="team-1">Team 1</SelectItem>
                  <SelectItem value="team-2">Team 2</SelectItem>
                  <SelectItem value="team-3">Team 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dimensions Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Settings className="h-3 w-3" />
                Dimensions
              </Label>
              <div className="space-y-2">
                {Object.values(ANALYTICS_DIMENSIONS).slice(0, 6).map(dimension => (
                  <div key={dimension} className="flex items-center space-x-2">
                    <Checkbox
                      id={dimension}
                      className="h-3 w-3"
                    />
                    <Label
                      htmlFor={dimension}
                      className="text-xs font-normal cursor-pointer flex-1"
                    >
                      {dimension.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs font-medium">Active Filters</Label>
              <div className="flex flex-wrap gap-1">
                {filters.platforms?.map(platform => (
                  <Badge key={platform} variant="secondary" className="text-xs">
                    {platformIcons[platform as keyof typeof platformIcons]}
                    <span className="ml-1 capitalize">{platform}</span>
                    <X 
                      className="ml-1 h-2 w-2 cursor-pointer" 
                      onClick={() => handlePlatformToggle(platform)}
                    />
                  </Badge>
                ))}
                {filters.metrics?.map(metric => (
                  <Badge key={metric} variant="secondary" className="text-xs">
                    {metric}
                    <X 
                      className="ml-1 h-2 w-2 cursor-pointer" 
                      onClick={() => handleMetricToggle(metric)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
