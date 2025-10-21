"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { AnalyticsData, TimeRange } from '@/lib/types/analytics';
import { 
  formatChartData, 
  formatDistributionData, 
  generateTimeSeriesData,
  generateTooltipContent,
  generateLegendContent,
  calculateChartStatistics,
  generateChartLoadingState,
  generateChartErrorState
} from '@/lib/utils/charts';
import { 
  formatNumber, 
  formatPercentage
} from '@/lib/utils/analytics';
import { CHART_COLORS } from '@/lib/constants/analytics-metrics';

interface AnalyticsChartsProps {
  data: AnalyticsData[];
  type: 'line' | 'bar' | 'area' | 'pie' | 'doughnut';
  metrics: string[];
  dimension?: string;
  timeRange?: TimeRange;
  title?: string;
  description?: string;
  className?: string;
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onFullscreen?: () => void;
}

export function AnalyticsCharts({
  data,
  type,
  metrics,
  dimension = 'date',
  timeRange,
  title,
  description,
  className,
  isLoading = false,
  error,
  onRefresh,
  onExport,
  onFullscreen,
}: AnalyticsChartsProps) {
  // Process chart data based on type
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    switch (type) {
      case 'line':
      case 'area':
      case 'bar':
        if (dimension === 'date' && timeRange) {
          return generateTimeSeriesData(data, metrics, timeRange);
        }
        return formatChartData(data, metrics[0], dimension);
      
      case 'pie':
      case 'doughnut':
        return formatDistributionData(data, dimension);
      
      default:
        return formatChartData(data, metrics[0], dimension);
    }
  }, [data, type, metrics, dimension, timeRange]);

  // Calculate chart statistics
  const statistics = useMemo(() => {
    if (type === 'pie' || type === 'doughnut') {
      const pieData = chartData as Array<{value: number}>;
      return {
        min: 0,
        max: Math.max(...pieData.map(d => d.value)),
        average: pieData.reduce((sum: number, d) => sum + d.value, 0) / pieData.length,
        total: pieData.reduce((sum: number, d) => sum + d.value, 0),
        trend: 'stable' as const,
      };
    }
    return calculateChartStatistics(chartData as Array<{value: number, date: string}>);
  }, [chartData, type]);

  // Generate chart colors
  const colors = useMemo(() => {
    const colorArray = Object.values(CHART_COLORS);
    return metrics.map((_, index) => colorArray[index % colorArray.length]);
  }, [metrics]);

  // Render chart based on type
  const renderChart = () => {
    if (isLoading) {
      return generateChartLoadingState();
    }

    if (error) {
      return generateChartErrorState(error, onRefresh);
    }

    if (!chartData || chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No data available for the selected period</p>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip 
                content={({ active, payload, label }) => 
                  generateTooltipContent(active, payload, String(label || ''), formatNumber)
                }
              />
              <Legend 
                content={({ payload }) => generateLegendContent(payload || [])}
              />
              {metrics.map((metric, index) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey="value"
                  stroke={colors[index]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip 
                content={({ active, payload, label }) => 
                  generateTooltipContent(active, payload, String(label || ''), formatNumber)
                }
              />
              <Legend 
                content={({ payload }) => generateLegendContent(payload || [])}
              />
              {metrics.map((metric, index) => (
                <Area
                  key={metric}
                  type="monotone"
                  dataKey="value"
                  stackId="1"
                  stroke={colors[index]}
                  fill={colors[index]}
                  fillOpacity={0.6}
                  name={metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={dimension === 'date' ? 'date' : 'category'} 
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => {
                  if (dimension === 'date') {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }
                  return value;
                }}
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip 
                content={({ active, payload, label }) => 
                  generateTooltipContent(active, payload, String(label || ''), formatNumber)
                }
              />
              <Legend 
                content={({ payload }) => generateLegendContent(payload || [])}
              />
              {metrics.map((metric, index) => (
                <Bar
                  key={metric}
                  dataKey="value"
                  fill={colors[index]}
                  radius={[4, 4, 0, 0]}
                  name={metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'doughnut':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={type === 'doughnut' ? 40 : 0}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="category"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900">{data.category}</p>
                        <p className="text-sm text-gray-600">
                          Value: {formatNumber(data.value)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Percentage: {formatPercentage(data.percentage)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                content={({ payload }) => generateLegendContent(payload || [])}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            {title && <CardTitle className="text-sm font-medium">{title}</CardTitle>}
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {statistics.trend !== 'stable' && (
              <Badge 
                variant={statistics.trend === 'up' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {statistics.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {statistics.trend}
              </Badge>
            )}
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <Button variant="ghost" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            {onFullscreen && (
              <Button variant="ghost" size="sm" onClick={onFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
        
        {/* Chart Statistics */}
        {!isLoading && !error && chartData.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-muted-foreground">Total</div>
                <div className="font-medium">{formatNumber(statistics.total)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Average</div>
                <div className="font-medium">{formatNumber(statistics.average)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Min</div>
                <div className="font-medium">{formatNumber(statistics.min)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Max</div>
                <div className="font-medium">{formatNumber(statistics.max)}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
