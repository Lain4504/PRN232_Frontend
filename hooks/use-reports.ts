// Report Generation and Management Hook
// Based on Story 3.4 requirements

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ReportData, 
  ExportData, 
  ExportRequest,
  AnalyticsFilters,
  TimeRange,
  AnalyticsData,
  CampaignAnalytics,
  ContentAnalytics,
  TeamAnalytics
} from '@/lib/types/analytics';
import { ANALYTICS_REPORT_TYPES, ANALYTICS_EXPORT_FORMATS } from '@/lib/constants/analytics-metrics';

// Mock API functions (replace with actual API calls)
const mockReportsApi = {
  getReports: async (): Promise<ReportData[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 'report-1',
        name: 'Monthly Campaign Performance',
        type: 'campaign',
        data: {} as CampaignAnalytics,
        filters: {
          platforms: ['facebook', 'instagram'],
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          }
        },
        generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        format: 'pdf',
        status: 'ready',
        downloadUrl: '/api/reports/report-1/download',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'report-2',
        name: 'Content Engagement Analysis',
        type: 'content',
        data: {} as ContentAnalytics,
        filters: {
          platforms: ['instagram', 'tiktok'],
          dateRange: {
            start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          }
        },
        generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        format: 'excel',
        status: 'ready',
        downloadUrl: '/api/reports/report-2/download',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'report-3',
        name: 'Team Productivity Report',
        type: 'team',
        data: {} as TeamAnalytics,
        filters: {
          dateRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          }
        },
        generatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        format: 'pdf',
        status: 'generating',
      },
    ];
  },

  getReport: async (reportId: string): Promise<ReportData> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id: reportId,
      name: 'Sample Report',
      type: 'custom',
      data: {} as AnalyticsData,
      filters: {},
      generatedAt: new Date().toISOString(),
      format: 'pdf',
      status: 'ready',
      downloadUrl: `/api/reports/${reportId}/download`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  createReport: async (reportData: Partial<ReportData>): Promise<ReportData> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newReport: ReportData = {
      id: `report-${Date.now()}`,
      name: reportData.name || 'New Report',
      type: reportData.type || 'custom',
      data: reportData.data || {} as AnalyticsData,
      filters: reportData.filters || {},
      generatedAt: new Date().toISOString(),
      format: reportData.format || 'pdf',
      status: 'generating',
    };
    
    return newReport;
  },

  updateReport: async (reportId: string, updates: Partial<ReportData>): Promise<ReportData> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: reportId,
      name: updates.name || 'Updated Report',
      type: updates.type || 'custom',
      data: updates.data || {} as AnalyticsData,
      filters: updates.filters || {},
      generatedAt: new Date().toISOString(),
      format: updates.format || 'pdf',
      status: 'ready',
      downloadUrl: `/api/reports/${reportId}/download`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  deleteReport: async (reportId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  exportReport: async (request: ExportRequest): Promise<ExportData> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      format: request.format,
      data: {},
      options: request.options,
      status: 'ready',
      downloadUrl: `/api/exports/export-${Date.now()}/download`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      generatedAt: new Date().toISOString(),
    };
  },

  getExportStatus: async (exportId: string): Promise<ExportData> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      format: 'pdf',
      data: {},
      options: {
        includeCharts: true,
        includeRawData: false,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
          period: 'day'
        },
        filters: {}
      },
      status: 'ready',
      downloadUrl: `/api/exports/${exportId}/download`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      generatedAt: new Date().toISOString(),
    };
  },
};

export function useReports() {
  const queryClient = useQueryClient();

  // Get all reports
  const {
    data: reports = [],
    isLoading: isLoadingReports,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ['reports'],
    queryFn: mockReportsApi.getReports,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: mockReportsApi.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  // Update report mutation
  const updateReportMutation = useMutation({
    mutationFn: ({ reportId, updates }: { reportId: string; updates: Partial<ReportData> }) =>
      mockReportsApi.updateReport(reportId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: mockReportsApi.deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  // Export report mutation
  const exportReportMutation = useMutation({
    mutationFn: mockReportsApi.exportReport,
  });

  // Create a new report
  const createReport = useCallback((reportData: Partial<ReportData>) => {
    return createReportMutation.mutateAsync(reportData);
  }, [createReportMutation]);

  // Update an existing report
  const updateReport = useCallback((reportId: string, updates: Partial<ReportData>) => {
    return updateReportMutation.mutateAsync({ reportId, updates });
  }, [updateReportMutation]);

  // Delete a report
  const deleteReport = useCallback((reportId: string) => {
    return deleteReportMutation.mutateAsync(reportId);
  }, [deleteReportMutation]);

  // Export a report
  const exportReport = useCallback((request: ExportRequest) => {
    return exportReportMutation.mutateAsync(request);
  }, [exportReportMutation]);

  // Get reports by type
  const getReportsByType = useCallback((type: string) => {
    return reports.filter(report => report.type === type);
  }, [reports]);

  // Get reports by status
  const getReportsByStatus = useCallback((status: string) => {
    return reports.filter(report => report.status === status);
  }, [reports]);

  // Get recent reports
  const getRecentReports = useCallback((limit: number = 5) => {
    return reports
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      .slice(0, limit);
  }, [reports]);

  // Get expired reports
  const getExpiredReports = useCallback(() => {
    const now = new Date();
    return reports.filter(report => 
      report.expiresAt && new Date(report.expiresAt) < now
    );
  }, [reports]);

  // Get reports statistics
  const reportsStats = useMemo(() => {
    const total = reports.length;
    const ready = reports.filter(r => r.status === 'ready').length;
    const generating = reports.filter(r => r.status === 'generating').length;
    const failed = reports.filter(r => r.status === 'failed').length;
    const expired = getExpiredReports().length;

    return {
      total,
      ready,
      generating,
      failed,
      expired,
      successRate: total > 0 ? Math.round((ready / total) * 100) : 0,
    };
  }, [reports, getExpiredReports]);

  return {
    // Data
    reports,
    isLoading: isLoadingReports,
    error: reportsError,
    
    // Mutations
    createReport,
    updateReport,
    deleteReport,
    exportReport,
    
    // Mutation states
    isCreating: createReportMutation.isPending,
    isUpdating: updateReportMutation.isPending,
    isDeleting: deleteReportMutation.isPending,
    isExporting: exportReportMutation.isPending,
    
    // Mutation errors
    createError: createReportMutation.error,
    updateError: updateReportMutation.error,
    deleteError: deleteReportMutation.error,
    exportError: exportReportMutation.error,
    
    // Utilities
    getReportsByType,
    getReportsByStatus,
    getRecentReports,
    getExpiredReports,
    reportsStats,
    refetch: refetchReports,
  };
}

export function useReport(reportId: string) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: () => mockReportsApi.getReport(reportId),
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useExportStatus(exportId: string) {
  return useQuery({
    queryKey: ['export-status', exportId],
    queryFn: () => mockReportsApi.getExportStatus(exportId),
    enabled: !!exportId,
    refetchInterval: (data) => {
      // Stop polling when export is ready or failed
      return data?.status === 'ready' || data?.status === 'failed' ? false : 2000;
    },
    staleTime: 0,
  });
}

export function useReportTemplates() {
  return useMemo(() => [
    {
      id: 'campaign-performance',
      name: 'Campaign Performance Report',
      type: 'campaign',
      description: 'Comprehensive campaign performance metrics and insights',
      defaultFilters: {
        platforms: ['facebook', 'instagram', 'twitter'],
        metrics: ['impressions', 'clicks', 'conversions', 'ctr', 'roi'],
      },
      defaultTimeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        period: 'day' as const,
      },
    },
    {
      id: 'content-engagement',
      name: 'Content Engagement Report',
      type: 'content',
      description: 'Detailed content performance and engagement analysis',
      defaultFilters: {
        platforms: ['instagram', 'tiktok', 'youtube'],
        metrics: ['engagement', 'reach', 'shares', 'comments', 'likes'],
      },
      defaultTimeRange: {
        start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        period: 'day' as const,
      },
    },
    {
      id: 'team-productivity',
      name: 'Team Productivity Report',
      type: 'team',
      description: 'Team performance and productivity metrics',
      defaultFilters: {
        metrics: ['productivity', 'collaboration', 'task_completion'],
      },
      defaultTimeRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        period: 'day' as const,
      },
    },
    {
      id: 'custom-analytics',
      name: 'Custom Analytics Report',
      type: 'custom',
      description: 'Fully customizable analytics report',
      defaultFilters: {},
      defaultTimeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        period: 'day' as const,
      },
    },
  ], []);
}

export function useReportBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [reportConfig, setReportConfig] = useState<Partial<ReportData>>({});
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    period: 'day',
  });

  const templates = useReportTemplates();

  // Get selected template
  const selectedTemplateData = useMemo(() => {
    return templates.find(template => template.id === selectedTemplate);
  }, [templates, selectedTemplate]);

  // Apply template
  const applyTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setReportConfig({
        name: template.name,
        type: template.type,
      });
      setFilters(template.defaultFilters);
      setTimeRange(template.defaultTimeRange);
    }
  }, [templates]);

  // Update report configuration
  const updateReportConfig = useCallback((updates: Partial<ReportData>) => {
    setReportConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  }, []);

  // Update time range
  const updateTimeRange = useCallback((newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
  }, []);

  // Reset builder
  const resetBuilder = useCallback(() => {
    setSelectedTemplate(null);
    setReportConfig({});
    setFilters({});
    setTimeRange({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      period: 'day',
    });
  }, []);

  // Generate report data
  const generateReportData = useCallback((): Partial<ReportData> => {
    return {
      ...reportConfig,
      filters,
      data: {
        id: 'temp-report-data',
        metrics: {} as any,
        dimensions: {} as any,
        timeRange,
        filters,
        aggregations: { sum: [], average: [], count: [], min: [], max: [] },
        generatedAt: new Date().toISOString(),
      },
    };
  }, [reportConfig, filters, timeRange]);

  return {
    // State
    selectedTemplate,
    reportConfig,
    filters,
    timeRange,
    templates,
    selectedTemplateData,
    
    // Actions
    applyTemplate,
    updateReportConfig,
    updateFilters,
    updateTimeRange,
    resetBuilder,
    generateReportData,
  };
}
