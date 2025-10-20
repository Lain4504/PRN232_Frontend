// Export Functionality Hook
// Based on Story 3.4 requirements

import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ExportData, 
  ExportRequest,
  ExportOptions,
  ReportData,
  AnalyticsData
} from '@/lib/types/analytics';
import { ANALYTICS_EXPORT_FORMATS, EXPORT_OPTIONS } from '@/lib/constants/analytics-metrics';

// Mock API functions (replace with actual API calls)
const mockExportApi = {
  exportData: async (request: ExportRequest): Promise<ExportData> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      format: request.format,
      data: request.options.includeRawData ? {} : {},
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

  downloadExport: async (exportId: string): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock blob creation
    const mockContent = 'Mock export content';
    return new Blob([mockContent], { type: 'application/pdf' });
  },
};

export function useExport() {
  const queryClient = useQueryClient();
  const [exportHistory, setExportHistory] = useState<ExportData[]>([]);

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: mockExportApi.exportData,
    onSuccess: (data) => {
      setExportHistory(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 exports
    },
  });

  // Download export mutation
  const downloadMutation = useMutation({
    mutationFn: mockExportApi.downloadExport,
  });

  // Export data
  const exportData = useCallback((request: ExportRequest) => {
    return exportMutation.mutateAsync(request);
  }, [exportMutation]);

  // Download export
  const downloadExport = useCallback((exportId: string) => {
    return downloadMutation.mutateAsync(exportId);
  }, [downloadMutation]);

  // Get export history
  const getExportHistory = useCallback(() => {
    return exportHistory;
  }, [exportHistory]);

  // Clear export history
  const clearExportHistory = useCallback(() => {
    setExportHistory([]);
  }, []);

  // Get export statistics
  const exportStats = useMemo(() => {
    const total = exportHistory.length;
    const successful = exportHistory.filter(e => e.status === 'ready').length;
    const failed = exportHistory.filter(e => e.status === 'failed').length;
    const pending = exportHistory.filter(e => e.status === 'processing').length;

    const formatCounts = exportHistory.reduce((acc, exportItem) => {
      acc[exportItem.format] = (acc[exportItem.format] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      successful,
      failed,
      pending,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
      formatCounts,
    };
  }, [exportHistory]);

  return {
    // Actions
    exportData,
    downloadExport,
    getExportHistory,
    clearExportHistory,
    
    // State
    isExporting: exportMutation.isPending,
    isDownloading: downloadMutation.isPending,
    exportError: exportMutation.error,
    downloadError: downloadMutation.error,
    exportHistory,
    exportStats,
  };
}

export function useExportOptions() {
  const [options, setOptions] = useState<ExportOptions>({
    includeCharts: true,
    includeRawData: false,
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      period: 'day'
    },
    filters: {}
  });

  // Update options
  const updateOptions = useCallback((newOptions: Partial<ExportOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Reset options
  const resetOptions = useCallback(() => {
    setOptions({
      includeCharts: true,
      includeRawData: false,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        period: 'day'
      },
      filters: {}
    });
  }, []);

  // Get format-specific options
  const getFormatOptions = useCallback((format: string) => {
    return EXPORT_OPTIONS[format as keyof typeof EXPORT_OPTIONS] || {};
  }, []);

  // Validate options
  const validateOptions = useCallback((format: string) => {
    const errors: string[] = [];
    
    if (!options.dateRange.start || !options.dateRange.end) {
      errors.push('Date range is required');
    }
    
    if (new Date(options.dateRange.start) >= new Date(options.dateRange.end)) {
      errors.push('Start date must be before end date');
    }
    
    const formatOptions = getFormatOptions(format);
    if (formatOptions.includeCharts === false && options.includeCharts) {
      errors.push(`${format.toUpperCase()} format does not support charts`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [options, getFormatOptions]);

  return {
    options,
    updateOptions,
    resetOptions,
    getFormatOptions,
    validateOptions,
  };
}

export function useExportFormats() {
  return useMemo(() => [
    {
      id: ANALYTICS_EXPORT_FORMATS.PDF,
      name: 'PDF',
      description: 'Portable Document Format with charts and visualizations',
      icon: '📄',
      supportsCharts: true,
      supportsRawData: false,
      maxFileSize: '10MB',
      recommended: true,
    },
    {
      id: ANALYTICS_EXPORT_FORMATS.EXCEL,
      name: 'Excel',
      description: 'Microsoft Excel spreadsheet with data and charts',
      icon: '📊',
      supportsCharts: true,
      supportsRawData: true,
      maxFileSize: '50MB',
      recommended: true,
    },
    {
      id: ANALYTICS_EXPORT_FORMATS.CSV,
      name: 'CSV',
      description: 'Comma-separated values for data analysis',
      icon: '📋',
      supportsCharts: false,
      supportsRawData: true,
      maxFileSize: '100MB',
      recommended: false,
    },
    {
      id: ANALYTICS_EXPORT_FORMATS.JSON,
      name: 'JSON',
      description: 'JavaScript Object Notation for developers',
      icon: '🔧',
      supportsCharts: false,
      supportsRawData: true,
      maxFileSize: '50MB',
      recommended: false,
    },
  ], []);
}

export function useExportTemplates() {
  return useMemo(() => [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level overview for executives and stakeholders',
      format: ANALYTICS_EXPORT_FORMATS.PDF,
      options: {
        includeCharts: true,
        includeRawData: false,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
          period: 'day'
        },
        filters: {},
        template: 'executive',
        branding: {
          companyName: 'AISAM',
          colors: ['#3b82f6', '#10b981'],
        }
      },
    },
    {
      id: 'detailed-analysis',
      name: 'Detailed Analysis',
      description: 'Comprehensive report with all data and insights',
      format: ANALYTICS_EXPORT_FORMATS.EXCEL,
      options: {
        includeCharts: true,
        includeRawData: true,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
          period: 'day'
        },
        filters: {},
        template: 'detailed',
      },
    },
    {
      id: 'data-export',
      name: 'Raw Data Export',
      description: 'Raw data for further analysis and processing',
      format: ANALYTICS_EXPORT_FORMATS.CSV,
      options: {
        includeCharts: false,
        includeRawData: true,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
          period: 'day'
        },
        filters: {},
        template: 'raw',
      },
    },
    {
      id: 'developer-export',
      name: 'Developer Export',
      description: 'JSON format for developers and integrations',
      format: ANALYTICS_EXPORT_FORMATS.JSON,
      options: {
        includeCharts: false,
        includeRawData: true,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
          period: 'day'
        },
        filters: {},
        template: 'developer',
      },
    },
  ], []);
}

export function useExportScheduler() {
  const [scheduledExports, setScheduledExports] = useState<Array<{
    id: string;
    name: string;
    schedule: string;
    format: string;
    options: ExportOptions;
    lastRun?: string;
    nextRun: string;
    status: 'active' | 'paused' | 'failed';
  }>>([]);

  // Add scheduled export
  const addScheduledExport = useCallback((exportConfig: {
    name: string;
    schedule: string;
    format: string;
    options: ExportOptions;
  }) => {
    const newExport = {
      id: `scheduled-${Date.now()}`,
      ...exportConfig,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day
      status: 'active' as const,
    };
    
    setScheduledExports(prev => [...prev, newExport]);
    return newExport.id;
  }, []);

  // Update scheduled export
  const updateScheduledExport = useCallback((id: string, updates: Partial<{
    name: string;
    schedule: string;
    format: string;
    options: ExportOptions;
    status: 'active' | 'paused' | 'failed';
  }>) => {
    setScheduledExports(prev => 
      prev.map(exp => 
        exp.id === id ? { ...exp, ...updates } : exp
      )
    );
  }, []);

  // Remove scheduled export
  const removeScheduledExport = useCallback((id: string) => {
    setScheduledExports(prev => prev.filter(exp => exp.id !== id));
  }, []);

  // Get scheduled exports
  const getScheduledExports = useCallback(() => {
    return scheduledExports;
  }, [scheduledExports]);

  // Get active scheduled exports
  const getActiveScheduledExports = useCallback(() => {
    return scheduledExports.filter(exp => exp.status === 'active');
  }, [scheduledExports]);

  return {
    scheduledExports,
    addScheduledExport,
    updateScheduledExport,
    removeScheduledExport,
    getScheduledExports,
    getActiveScheduledExports,
  };
}

export function useExportLimits(subscriptionTier: string = 'free') {
  return useMemo(() => {
    const limits = {
      free: {
        maxExportsPerDay: 5,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxDataPoints: 10000,
        allowedFormats: [ANALYTICS_EXPORT_FORMATS.PDF, ANALYTICS_EXPORT_FORMATS.CSV],
        scheduledExports: 0,
        retentionDays: 7,
      },
      pro: {
        maxExportsPerDay: 50,
        maxFileSize: 100 * 1024 * 1024, // 100MB
        maxDataPoints: 100000,
        allowedFormats: Object.values(ANALYTICS_EXPORT_FORMATS),
        scheduledExports: 5,
        retentionDays: 30,
      },
      enterprise: {
        maxExportsPerDay: -1, // Unlimited
        maxFileSize: 500 * 1024 * 1024, // 500MB
        maxDataPoints: -1, // Unlimited
        allowedFormats: Object.values(ANALYTICS_EXPORT_FORMATS),
        scheduledExports: -1, // Unlimited
        retentionDays: 365,
      },
    };

    return limits[subscriptionTier as keyof typeof limits] || limits.free;
  }, [subscriptionTier]);
}
