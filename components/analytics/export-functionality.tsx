"use client";

import React, { useState } from 'react';
import { Card, CardContent} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File, 
  Code,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  History,
  Calendar,
  Filter
} from 'lucide-react';
import { ExportData } from '@/lib/types/analytics';
import { useExportFormats, useExportTemplates, useExportOptions } from '@/hooks/use-export';
import { ANALYTICS_EXPORT_FORMATS } from '@/lib/constants/analytics-metrics';
import { toast } from 'sonner';

interface ExportFunctionalityProps {
  onExport: (format: string) => void;
  isExporting: boolean;
  exportHistory: ExportData[];
  className?: string;
}

export function ExportFunctionality({ 
  onExport, 
  isExporting, 
  exportHistory,
  className 
}: ExportFunctionalityProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(ANALYTICS_EXPORT_FORMATS.PDF);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [activeTab, setActiveTab] = useState('export');

  const formats = useExportFormats();
  const templates = useExportTemplates();
  const { options, updateOptions, validateOptions } = useExportOptions();

  // Get format icon
  const getFormatIcon = (format: string) => {
    switch (format) {
      case ANALYTICS_EXPORT_FORMATS.PDF:
        return <FileText className="h-4 w-4" />;
      case ANALYTICS_EXPORT_FORMATS.EXCEL:
        return <FileSpreadsheet className="h-4 w-4" />;
      case ANALYTICS_EXPORT_FORMATS.CSV:
        return <File className="h-4 w-4" />;
      case ANALYTICS_EXPORT_FORMATS.JSON:
        return <Code className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Handle export
  const handleExport = () => {
    const validation = validateOptions(selectedFormat);
    if (!validation.isValid) {
      toast.error(`Validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    updateOptions({
      includeCharts,
      includeRawData,
    });

    onExport(selectedFormat);
    setIsDialogOpen(false);
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSelectedFormat(template.format);
      setIncludeCharts(template.options.includeCharts);
      setIncludeRawData(template.options.includeRawData);
    }
  };

  // Get recent exports
  const recentExports = exportHistory.slice(0, 5);

  return (
    <div className={className}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Analytics Data</DialogTitle>
            <DialogDescription>
              Choose your export format and options to download your analytics data
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4">
              {/* Format Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Export Format</Label>
                <div className="grid grid-cols-2 gap-2">
                  {formats.map((format) => (
                    <Button
                      key={format.id}
                      variant={selectedFormat === format.id ? "default" : "outline"}
                      onClick={() => setSelectedFormat(format.id)}
                      className="h-auto p-3 flex flex-col items-start"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getFormatIcon(format.id)}
                        <span className="font-medium">{format.name}</span>
                        {format.recommended && (
                          <Badge variant="secondary" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        {format.description}
                      </p>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Export Options</Label>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={includeCharts}
                      onCheckedChange={setIncludeCharts}
                      disabled={!formats.find(f => f.id === selectedFormat)?.supportsCharts}
                    />
                    <Label htmlFor="includeCharts" className="text-sm">
                      Include charts and visualizations
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeRawData"
                      checked={includeRawData}
                      onCheckedChange={setIncludeRawData}
                    />
                    <Label htmlFor="includeRawData" className="text-sm">
                      Include raw data
                    </Label>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExport} disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="space-y-3">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {getFormatIcon(template.format)}
                            <span className="text-xs text-muted-foreground">
                              {template.format.toUpperCase()}
                            </span>
                            {template.options.includeCharts && (
                              <Badge variant="outline" className="text-xs">
                                <Filter className="h-3 w-3 mr-1" />
                                Charts
                              </Badge>
                            )}
                            {template.options.includeRawData && (
                              <Badge variant="outline" className="text-xs">
                                <File className="h-3 w-3 mr-1" />
                                Raw Data
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTemplateSelect(template.id);
                          }}
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3">
                {recentExports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No export history available</p>
                  </div>
                ) : (
                  recentExports.map((exportItem) => (
                    <Card key={exportItem.generatedAt}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getFormatIcon(exportItem.format)}
                            <div>
                              <p className="text-sm font-medium">
                                {exportItem.format.toUpperCase()} Export
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(exportItem.generatedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(exportItem.status)}
                            <Badge 
                              variant={
                                exportItem.status === 'ready' ? 'default' :
                                exportItem.status === 'processing' ? 'secondary' :
                                'destructive'
                              }
                              className="text-xs"
                            >
                              {exportItem.status}
                            </Badge>
                            {exportItem.status === 'ready' && exportItem.downloadUrl && (
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
