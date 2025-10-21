// Chart and Visualization Utilities
// Based on Story 3.4 requirements

import { 
  ChartDataPoint, 
  TimeSeriesData, 
  DistributionData,
  AnalyticsData 
} from '@/lib/types/analytics';
import { 
  CHART_COLORS, 
  CHART_TYPES,
  ANALYTICS_METRICS 
} from '@/lib/constants/analytics-metrics';

/**
 * Generate chart configuration for Recharts
 */
export function generateChartConfig(
  type: string,
  data: ChartDataPoint[] | DistributionData[],
  options: {
    width?: number;
    height?: number;
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
  } = {}
) {
  const {
    width = 400,
    height = 300,
    colors = Object.values(CHART_COLORS),
    showLegend = true,
    showGrid = true,
    showTooltip = true,
    showXAxis = true,
    showYAxis = true
  } = options;

  const baseConfig = {
    width,
    height,
    margin: {
      top: 20,
      right: 30,
      left: 20,
      bottom: 5,
    },
    colors,
  };

  switch (type) {
    case CHART_TYPES.LINE:
      return {
        ...baseConfig,
        type: 'line',
        data,
        showLegend,
        showGrid,
        showTooltip,
        showXAxis,
        showYAxis,
        strokeWidth: 2,
        dot: { r: 4 },
        activeDot: { r: 6 },
      };

    case CHART_TYPES.BAR:
      return {
        ...baseConfig,
        type: 'bar',
        data,
        showLegend,
        showGrid,
        showTooltip,
        showXAxis,
        showYAxis,
        barSize: 20,
        radius: [4, 4, 0, 0],
      };

    case CHART_TYPES.AREA:
      return {
        ...baseConfig,
        type: 'area',
        data,
        showLegend,
        showGrid,
        showTooltip,
        showXAxis,
        showYAxis,
        strokeWidth: 2,
        fillOpacity: 0.6,
      };

    case CHART_TYPES.PIE:
      return {
        ...baseConfig,
        type: 'pie',
        data,
        showLegend,
        showTooltip,
        innerRadius: 0,
        outerRadius: 80,
        paddingAngle: 5,
        cornerRadius: 5,
      };

    case CHART_TYPES.DOUGHNUT:
      return {
        ...baseConfig,
        type: 'doughnut',
        data,
        showLegend,
        showTooltip,
        innerRadius: 40,
        outerRadius: 80,
        paddingAngle: 5,
        cornerRadius: 5,
      };

    default:
      return baseConfig;
  }
}

/**
 * Generate responsive chart dimensions
 */
export function getResponsiveChartDimensions(
  containerWidth: number,
  aspectRatio: number = 16 / 9
): { width: number; height: number } {
  const maxWidth = Math.min(containerWidth, 800);
  const width = maxWidth;
  const height = Math.round(width / aspectRatio);
  
  return { width, height };
}

/**
 * Format chart data for different chart types
 */
export function formatChartData(
  data: AnalyticsData[],
  metric: string,
  dimension: string = 'date'
): ChartDataPoint[] {
  return data.map(item => ({
    date: item.dimensions[dimension as keyof typeof item.dimensions] as string,
    value: item.metrics[metric as keyof typeof item.metrics] as number,
    label: formatChartLabel(item.dimensions[dimension as keyof typeof item.dimensions] as string),
    metadata: {
      platform: item.dimensions.platform,
      campaignId: item.dimensions.campaignId,
      contentId: item.dimensions.contentId,
    }
  }));
}

/**
 * Format distribution data for pie/doughnut charts
 */
export function formatDistributionData(
  data: AnalyticsData[],
  dimension: string
): DistributionData[] {
  const distribution = data.reduce((acc, item) => {
    const value = item.dimensions[dimension as keyof typeof item.dimensions] as string;
    if (value) {
      acc[value] = (acc[value] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  return Object.entries(distribution).map(([category, value], index) => ({
    category,
    value,
    percentage: (value / total) * 100,
    color: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]
  }));
}

/**
 * Generate time series data for multiple metrics
 */
export function generateTimeSeriesData(
  data: AnalyticsData[],
  metrics: string[],
  timeRange: { start: string; end: string; period: string }
): TimeSeriesData[] {
  const timeSeries: TimeSeriesData[] = [];
  
  metrics.forEach((metric, index) => {
    const metricData = data
      .filter(item => item.metrics[metric as keyof typeof item.metrics] !== undefined)
      .map(item => ({
        date: item.dimensions.date,
        value: item.metrics[metric as keyof typeof item.metrics] as number,
        label: formatChartLabel(item.dimensions.date)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    timeSeries.push({
      metric,
      data: metricData,
      color: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length],
      type: 'line'
    });
  });

  return timeSeries;
}

/**
 * Format chart label for display
 */
function formatChartLabel(value: string): string {
  // Try to parse as date
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Return as is if not a date
  return value;
}

/**
 * Generate chart tooltip content
 */
export function generateTooltipContent(
  active: boolean,
  payload: Array<{value: number; name: string; color: string; dataKey: string}>,
  label: string,
  formatValue?: (value: number) => string
): JSX.Element | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const defaultFormatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(1);
  };

  const formatter = formatValue || defaultFormatValue;

  return {
    content: (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.dataKey}:</span>
            <span className="font-medium text-gray-900">
              {formatter(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  };
}

/**
 * Generate chart legend content
 */
export function generateLegendContent(
  payload: ReadonlyArray<{value: number; name: string; color: string; dataKey: string}>,
  onClick?: (dataKey: string) => void
): JSX.Element | null {
  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {payload.map((entry, index) => (
        <div 
          key={index}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80"
          onClick={() => onClick?.(entry.dataKey)}
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Calculate chart statistics
 */
export function calculateChartStatistics(data: ChartDataPoint[]): {
  min: number;
  max: number;
  average: number;
  total: number;
  trend: 'up' | 'down' | 'stable';
} {
  if (data.length === 0) {
    return { min: 0, max: 0, average: 0, total: 0, trend: 'stable' };
  }

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const total = values.reduce((sum, value) => sum + value, 0);
  const average = total / values.length;

  // Calculate trend
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstAvg = firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (secondAvg > firstAvg * 1.1) trend = 'up';
  else if (secondAvg < firstAvg * 0.9) trend = 'down';

  return { min, max, average, total, trend };
}

/**
 * Generate chart accessibility attributes
 */
export function generateAccessibilityAttributes(
  chartType: string,
  data: ChartDataPoint[] | DistributionData[]
): {
  'aria-label': string;
  'aria-describedby': string;
  role: string;
} {
  const dataLength = data.length;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return {
    'aria-label': `${chartType} chart showing ${dataLength} data points with total value of ${total}`,
    'aria-describedby': `chart-description-${chartType}`,
    role: 'img'
  };
}

/**
 * Generate chart color palette
 */
export function generateColorPalette(
  count: number,
  baseColors: string[] = Object.values(CHART_COLORS)
): string[] {
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  const colors = [...baseColors];
  while (colors.length < count) {
    // Generate additional colors by varying hue
    const hue = (colors.length * 137.5) % 360; // Golden angle approximation
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }

  return colors;
}

/**
 * Validate chart data
 */
export function validateChartData(data: unknown[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Chart data must be an array');
    return { isValid: false, errors };
  }

  if (data.length === 0) {
    errors.push('Chart data cannot be empty');
    return { isValid: false, errors };
  }

  data.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`Data item at index ${index} must be an object`);
      return;
    }

    if (typeof item.value !== 'number' || isNaN(item.value)) {
      errors.push(`Data item at index ${index} must have a valid numeric value`);
    }

    if (!item.date && !item.category) {
      errors.push(`Data item at index ${index} must have either a date or category`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate chart export data
 */
export function generateChartExportData(
  data: ChartDataPoint[] | DistributionData[],
  format: 'csv' | 'json' = 'csv'
): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }

  // CSV format
  const headers = Object.keys(data[0] || {});
  const csvRows = [headers.join(',')];
  
  data.forEach(item => {
    const values = headers.map(header => {
      const value = item[header as keyof typeof item];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Generate chart loading state
 */
export function generateChartLoadingState(
  width: number = 400,
  height: number = 300
): JSX.Element {
  return (
    <div 
      className="flex items-center justify-center bg-gray-50 rounded-lg animate-pulse"
      style={{ width, height }}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">Loading chart data...</p>
      </div>
    </div>
  );
}

/**
 * Generate chart error state
 */
export function generateChartErrorState(
  error: string,
  onRetry?: () => void,
  width: number = 400,
  height: number = 300
): JSX.Element {
  return (
    <div 
      className="flex items-center justify-center bg-red-50 rounded-lg border border-red-200"
      style={{ width, height }}
    >
      <div className="text-center">
        <div className="text-red-500 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-sm text-red-600 mb-2">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
