// Export Utility Functions
// Based on Story 3.4 requirements

import { 
  ExportOptions,
  AnalyticsData,
  CampaignAnalytics,
  ContentAnalytics,
  TeamAnalytics
} from '@/lib/types/analytics';
import { ANALYTICS_EXPORT_FORMATS } from '@/lib/constants/analytics-metrics';

/**
 * Generate CSV content from analytics data
 */
export function generateCSVContent(
  data: AnalyticsData[] | CampaignAnalytics | ContentAnalytics | TeamAnalytics,
  options: ExportOptions
): string {
  if (Array.isArray(data)) {
    return generateCSVFromArray(data, options);
  } else {
    return generateCSVFromObject(data, options);
  }
}

/**
 * Generate CSV from array of analytics data
 */
function generateCSVFromArray(data: AnalyticsData[], options: ExportOptions): string {
  if (data.length === 0) return '';

  const headers = [
    'Date',
    'Platform',
    'Impressions',
    'Clicks',
    'Conversions',
    'CTR',
    'CPC',
    'CPM',
    'ROI',
    'Engagement',
    'Reach',
    'Shares',
    'Comments',
    'Likes',
    'Saves'
  ];

  const rows = data.map(item => [
    item.dimensions.date,
    item.dimensions.platform,
    item.metrics.impressions,
    item.metrics.clicks,
    item.metrics.conversions,
    item.metrics.ctr,
    item.metrics.cpc,
    item.metrics.cpm,
    item.metrics.roi,
    item.metrics.engagement,
    item.metrics.reach,
    item.metrics.shares,
    item.metrics.comments,
    item.metrics.likes,
    item.metrics.saves
  ]);

  return [headers, ...rows].map(row => 
    row.map(cell => typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell).join(',')
  ).join('\n');
}

/**
 * Generate CSV from single analytics object
 */
function generateCSVFromObject(
  data: CampaignAnalytics | ContentAnalytics | TeamAnalytics,
  options: ExportOptions
): string {
  const rows: string[][] = [];
  
  if ('campaignId' in data) {
    // Campaign analytics
    const campaignData = data as CampaignAnalytics;
    rows.push(['Campaign ID', campaignData.campaignId]);
    rows.push(['Campaign Name', campaignData.campaignName]);
    rows.push(['Impressions', campaignData.metrics.impressions.toString()]);
    rows.push(['Clicks', campaignData.metrics.clicks.toString()]);
    rows.push(['Conversions', campaignData.metrics.conversions.toString()]);
    rows.push(['CTR', campaignData.metrics.ctr.toString()]);
    rows.push(['CPC', campaignData.metrics.cpc.toString()]);
    rows.push(['ROI', campaignData.metrics.roi.toString()]);
    rows.push(['Budget', campaignData.performance.budget.toString()]);
    rows.push(['Spent', campaignData.performance.spent.toString()]);
    rows.push(['Remaining', campaignData.performance.remaining.toString()]);
  } else if ('contentId' in data) {
    // Content analytics
    const contentData = data as ContentAnalytics;
    rows.push(['Content ID', contentData.contentId]);
    rows.push(['Content Title', contentData.contentTitle]);
    rows.push(['Content Type', contentData.contentType]);
    rows.push(['Impressions', contentData.metrics.impressions.toString()]);
    rows.push(['Engagement Rate', contentData.engagement.rate.toString()]);
    rows.push(['Reach', contentData.reach.total.toString()]);
    rows.push(['Shares', contentData.metrics.shares.toString()]);
    rows.push(['Comments', contentData.metrics.comments.toString()]);
    rows.push(['Likes', contentData.metrics.likes.toString()]);
    rows.push(['Performance Score', contentData.performance.score.toString()]);
  } else if ('teamId' in data) {
    // Team analytics
    const teamData = data as TeamAnalytics;
    rows.push(['Team ID', teamData.teamId]);
    rows.push(['Team Name', teamData.teamName]);
    rows.push(['Team Members', teamData.resourceUsage.teamMembers.toString()]);
    rows.push(['Total Budget', teamData.resourceUsage.totalBudget.toString()]);
    rows.push(['Used Budget', teamData.resourceUsage.usedBudget.toString()]);
    rows.push(['Active Campaigns', teamData.resourceUsage.activeCampaigns.toString()]);
    rows.push(['Content Pieces', teamData.resourceUsage.contentPieces.toString()]);
    rows.push(['Task Completion', teamData.productivity.averageTaskCompletion.toString()]);
    rows.push(['Campaign Performance', teamData.productivity.averageCampaignPerformance.toString()]);
    rows.push(['Content Quality', teamData.productivity.contentQualityScore.toString()]);
  }

  return rows.map(row => 
    row.map(cell => typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell).join(',')
  ).join('\n');
}

/**
 * Generate Excel content (simplified - would use a library like xlsx in real implementation)
 */
export function generateExcelContent(
  data: AnalyticsData[] | CampaignAnalytics | ContentAnalytics | TeamAnalytics,
  options: ExportOptions
): string {
  // In a real implementation, this would use a library like xlsx
  // For now, return CSV format as Excel can import CSV
  return generateCSVContent(data, options);
}

/**
 * Generate JSON content
 */
export function generateJSONContent(
  data: AnalyticsData[] | CampaignAnalytics | ContentAnalytics | TeamAnalytics,
  options: ExportOptions
): string {
  const exportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      format: 'json',
      options,
      version: '1.0'
    },
    data
  };

  return JSON.stringify(exportData, null, options.prettyPrint ? 2 : 0);
}

/**
 * Generate PDF content (simplified - would use a library like jsPDF in real implementation)
 */
export function generatePDFContent(
  data: AnalyticsData[] | CampaignAnalytics | ContentAnalytics | TeamAnalytics,
  options: ExportOptions
): string {
  // In a real implementation, this would use a library like jsPDF or Puppeteer
  // For now, return a simplified HTML representation
  return generateHTMLContent(data, options);
}

/**
 * Generate HTML content for PDF conversion
 */
function generateHTMLContent(
  data: AnalyticsData[] | CampaignAnalytics | ContentAnalytics | TeamAnalytics,
  options: ExportOptions
): string {
  const title = Array.isArray(data) ? 'Analytics Data' : 
    'campaignId' in data ? `Campaign: ${(data as CampaignAnalytics).campaignName}` :
    'contentId' in data ? `Content: ${(data as ContentAnalytics).contentTitle}` :
    `Team: ${(data as TeamAnalytics).teamName}`;

  let content = '';
  
  if (Array.isArray(data)) {
    content = generateHTMLTable(data);
  } else {
    content = generateHTMLSummary(data);
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-label { font-weight: bold; color: #666; }
        .metric-value { font-size: 1.2em; color: #333; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="summary">
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Date Range:</strong> ${options.dateRange.start} to ${options.dateRange.end}</p>
      </div>
      ${content}
    </body>
    </html>
  `;
}

/**
 * Generate HTML table from analytics data array
 */
function generateHTMLTable(data: AnalyticsData[]): string {
  if (data.length === 0) return '<p>No data available</p>';

  const headers = [
    'Date', 'Platform', 'Impressions', 'Clicks', 'Conversions', 
    'CTR', 'CPC', 'ROI', 'Engagement', 'Reach'
  ];

  const rows = data.map(item => [
    item.dimensions.date,
    item.dimensions.platform,
    item.metrics.impressions.toLocaleString(),
    item.metrics.clicks.toLocaleString(),
    item.metrics.conversions.toLocaleString(),
    `${item.metrics.ctr.toFixed(2)}%`,
    `$${item.metrics.cpc.toFixed(2)}`,
    `${(item.metrics.roi * 100).toFixed(1)}%`,
    item.metrics.engagement.toLocaleString(),
    item.metrics.reach.toLocaleString()
  ]);

  const headerRow = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
  const dataRows = rows.map(row => 
    `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
  ).join('');

  return `<table>${headerRow}${dataRows}</table>`;
}

/**
 * Generate HTML summary from single analytics object
 */
function generateHTMLSummary(
  data: CampaignAnalytics | ContentAnalytics | TeamAnalytics
): string {
  let metrics: Array<{label: string, value: string}> = [];

  if ('campaignId' in data) {
    const campaignData = data as CampaignAnalytics;
    metrics = [
      { label: 'Campaign Name', value: campaignData.campaignName },
      { label: 'Impressions', value: campaignData.metrics.impressions.toLocaleString() },
      { label: 'Clicks', value: campaignData.metrics.clicks.toLocaleString() },
      { label: 'Conversions', value: campaignData.metrics.conversions.toLocaleString() },
      { label: 'CTR', value: `${campaignData.metrics.ctr.toFixed(2)}%` },
      { label: 'CPC', value: `$${campaignData.metrics.cpc.toFixed(2)}` },
      { label: 'ROI', value: `${(campaignData.metrics.roi * 100).toFixed(1)}%` },
      { label: 'Budget', value: `$${campaignData.performance.budget.toLocaleString()}` },
      { label: 'Spent', value: `$${campaignData.performance.spent.toLocaleString()}` },
      { label: 'Remaining', value: `$${campaignData.performance.remaining.toLocaleString()}` }
    ];
  } else if ('contentId' in data) {
    const contentData = data as ContentAnalytics;
    metrics = [
      { label: 'Content Title', value: contentData.contentTitle },
      { label: 'Content Type', value: contentData.contentType },
      { label: 'Impressions', value: contentData.metrics.impressions.toLocaleString() },
      { label: 'Engagement Rate', value: `${contentData.engagement.rate.toFixed(2)}%` },
      { label: 'Reach', value: contentData.reach.total.toLocaleString() },
      { label: 'Shares', value: contentData.metrics.shares.toLocaleString() },
      { label: 'Comments', value: contentData.metrics.comments.toLocaleString() },
      { label: 'Likes', value: contentData.metrics.likes.toLocaleString() },
      { label: 'Performance Score', value: `${contentData.performance.score}/100` }
    ];
  } else if ('teamId' in data) {
    const teamData = data as TeamAnalytics;
    metrics = [
      { label: 'Team Name', value: teamData.teamName },
      { label: 'Team Members', value: teamData.resourceUsage.teamMembers.toString() },
      { label: 'Total Budget', value: `$${teamData.resourceUsage.totalBudget.toLocaleString()}` },
      { label: 'Used Budget', value: `$${teamData.resourceUsage.usedBudget.toLocaleString()}` },
      { label: 'Active Campaigns', value: teamData.resourceUsage.activeCampaigns.toString() },
      { label: 'Content Pieces', value: teamData.resourceUsage.contentPieces.toString() },
      { label: 'Task Completion', value: `${teamData.productivity.averageTaskCompletion.toFixed(1)}%` },
      { label: 'Campaign Performance', value: `${teamData.productivity.averageCampaignPerformance.toFixed(1)}%` },
      { label: 'Content Quality', value: `${teamData.productivity.contentQualityScore.toFixed(1)}%` }
    ];
  }

  return `
    <div class="summary">
      ${metrics.map(metric => 
        `<div class="metric">
          <div class="metric-label">${metric.label}:</div>
          <div class="metric-value">${metric.value}</div>
        </div>`
      ).join('')}
    </div>
  `;
}

/**
 * Download file with generated content
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: string): string {
  switch (format) {
    case ANALYTICS_EXPORT_FORMATS.PDF:
      return 'application/pdf';
    case ANALYTICS_EXPORT_FORMATS.CSV:
      return 'text/csv';
    case ANALYTICS_EXPORT_FORMATS.EXCEL:
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case ANALYTICS_EXPORT_FORMATS.JSON:
      return 'application/json';
    default:
      return 'text/plain';
  }
}

/**
 * Get file extension for export format
 */
export function getFileExtension(format: string): string {
  switch (format) {
    case ANALYTICS_EXPORT_FORMATS.PDF:
      return 'pdf';
    case ANALYTICS_EXPORT_FORMATS.CSV:
      return 'csv';
    case ANALYTICS_EXPORT_FORMATS.EXCEL:
      return 'xlsx';
    case ANALYTICS_EXPORT_FORMATS.JSON:
      return 'json';
    default:
      return 'txt';
  }
}

/**
 * Generate filename for export
 */
export function generateFilename(
  type: string,
  format: string,
  timestamp?: Date
): string {
  const date = timestamp || new Date();
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
  const extension = getFileExtension(format);
  
  return `${type}-analytics-${dateStr}-${timeStr}.${extension}`;
}

/**
 * Validate export data
 */
export function validateExportData(
  data: unknown,
  format: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data) {
    errors.push('No data provided for export');
    return { isValid: false, errors };
  }

  if (Array.isArray(data) && data.length === 0) {
    errors.push('Data array is empty');
  }

  if (format === ANALYTICS_EXPORT_FORMATS.CSV && Array.isArray(data)) {
    // Validate CSV data structure
    const firstItem = data[0];
    if (firstItem && (!firstItem.metrics || !firstItem.dimensions)) {
      errors.push('Invalid analytics data structure for CSV export');
    }
  }

  if (format === ANALYTICS_EXPORT_FORMATS.JSON) {
    try {
      JSON.stringify(data);
    } catch (error) {
      errors.push('Data cannot be serialized to JSON');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format data for export based on options
 */
export function formatDataForExport(
  data: unknown,
  options: ExportOptions
): unknown {
  if (!options.includeRawData) {
    // Return summary data only
    if (Array.isArray(data)) {
      return data.map(item => ({
        date: item.dimensions.date,
        platform: item.dimensions.platform,
        impressions: item.metrics.impressions,
        clicks: item.metrics.clicks,
        ctr: item.metrics.ctr,
        engagement: item.metrics.engagement
      }));
    }
    return data;
  }

  return data;
}

/**
 * Generate export metadata
 */
export function generateExportMetadata(
  data: unknown,
  options: ExportOptions,
  format: string
): Record<string, unknown> {
  return {
    format,
    generatedAt: new Date().toISOString(),
    dataType: Array.isArray(data) ? 'array' : typeof data,
    recordCount: Array.isArray(data) ? data.length : 1,
    options: {
      includeCharts: options.includeCharts,
      includeRawData: options.includeRawData,
      dateRange: options.dateRange
    },
    version: '1.0'
  };
}
