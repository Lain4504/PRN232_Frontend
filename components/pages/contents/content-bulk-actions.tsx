"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckSquare,
  Square,
  Send,
  Calendar,
  Archive,
  Trash2,
  Tag,
  Download,
  Upload,
  Copy,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { contentApi } from "@/lib/mock-api";
import { Content } from "@/lib/types/aisam-types";
import { toast } from "sonner";

interface ContentBulkActionsProps {
  contents: Content[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onUpdate: () => void;
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  variant: 'default' | 'destructive' | 'outline';
  confirmRequired?: boolean;
  confirmMessage?: string;
}

const bulkActions: BulkAction[] = [
  {
    id: 'submit_approval',
    label: 'Submit for Approval',
    icon: Send,
    description: 'Submit selected draft content for approval',
    variant: 'default',
  },
  {
    id: 'schedule',
    label: 'Schedule Publishing',
    icon: Calendar,
    description: 'Schedule selected approved content for publishing',
    variant: 'default',
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    description: 'Move selected content to archive',
    variant: 'outline',
    confirmRequired: true,
    confirmMessage: 'Are you sure you want to archive the selected content? It will be hidden from your main content list but can be restored later.',
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    description: 'Permanently delete selected content',
    variant: 'destructive',
    confirmRequired: true,
    confirmMessage: 'Are you sure you want to permanently delete the selected content? This action cannot be undone.',
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    description: 'Export selected content as CSV or JSON',
    variant: 'outline',
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    description: 'Create copies of selected content',
    variant: 'outline',
  },
];

export function ContentBulkActions({ contents, selectedIds, onSelectionChange, onUpdate }: ContentBulkActionsProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<BulkAction | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notes: '',
  });

  const selectedContents = contents.filter(content => selectedIds.includes(content.id));

  const handleSelectAll = () => {
    if (selectedIds.length === contents.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(contents.map(c => c.id));
    }
  };

  const handleBulkAction = async (action: BulkAction) => {
    if (action.confirmRequired) {
      setShowConfirmDialog(action);
      return;
    }

    await executeBulkAction(action);
  };

  const executeBulkAction = async (action: BulkAction) => {
    try {
      setActionLoading(action.id);

      switch (action.id) {
        case 'submit_approval':
          await handleBulkSubmitApproval();
          break;
        case 'schedule':
          await handleBulkSchedule();
          break;
        case 'archive':
          await handleBulkArchive();
          break;
        case 'delete':
          await handleBulkDelete();
          break;
        case 'export':
          await handleBulkExport();
          break;
        case 'duplicate':
          await handleBulkDuplicate();
          break;
      }

      onSelectionChange([]);
      onUpdate();
    } catch (error) {
      console.error(`Failed to execute bulk ${action.id}:`, error);
      toast.error(`Failed to ${action.label.toLowerCase()}`);
    } finally {
      setActionLoading(null);
      setShowConfirmDialog(null);
    }
  };

  const handleBulkSubmitApproval = async () => {
    const draftContents = selectedContents.filter(c => c.status === 'draft');

    for (const content of draftContents) {
      await contentApi.submitForApproval(content.id);
    }

    toast.success(`Submitted ${draftContents.length} content${draftContents.length > 1 ? 's' : ''} for approval`);
  };

  const handleBulkSchedule = async () => {
    // This would open a scheduling dialog for all selected content
    toast.success('Bulk scheduling feature coming soon');
  };

  const handleBulkArchive = async () => {
    // Mock archive - in real app, this would call an archive API
    toast.success(`Archived ${selectedContents.length} content${selectedContents.length > 1 ? 's' : ''}`);
  };

  const handleBulkDelete = async () => {
    for (const content of selectedContents) {
      // Mock delete - in real app, this would call delete API
      console.log('Deleting content:', content.id);
    }

    toast.success(`Deleted ${selectedContents.length} content${selectedContents.length > 1 ? 's' : ''}`);
  };

  const handleBulkExport = async () => {
    const exportData = selectedContents.map(content => ({
      id: content.id,
      title: content.title,
      content: content.text_content,
      status: content.status,
      type: content.ad_type,
      created: content.created_at,
      updated: content.updated_at,
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `content-export-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success(`Exported ${selectedContents.length} content${selectedContents.length > 1 ? 's' : ''}`);
  };

  const handleBulkDuplicate = async () => {
    for (const content of selectedContents) {
      const { id, ...contentWithoutId } = content;
      const duplicateData = {
        ...contentWithoutId,
        title: `${content.title} (Copy)`,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await contentApi.createContent(duplicateData);
    }

    toast.success(`Duplicated ${selectedContents.length} content${selectedContents.length > 1 ? 's' : ''}`);
  };

  const getAvailableActions = () => {
    if (selectedContents.length === 0) return [];

    const statuses = [...new Set(selectedContents.map(c => c.status))];

    return bulkActions.filter(action => {
      switch (action.id) {
        case 'submit_approval':
          return statuses.every(status => status === 'draft');
        case 'schedule':
          return statuses.every(status => status === 'approved');
        case 'archive':
        case 'delete':
        case 'export':
        case 'duplicate':
          return true;
        default:
          return true;
      }
    });
  };

  const availableActions = getAvailableActions();

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.length === contents.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedIds.length} of {contents.length} selected
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectionChange([])}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear selection
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {availableActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  onClick={() => handleBulkAction(action)}
                  disabled={actionLoading === action.id}
                  className="flex items-center gap-2"
                >
                  {actionLoading === action.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <action.icon className="h-4 w-4" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Selected Content Summary */}
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedContents.slice(0, 5).map((content) => (
              <Badge key={content.id} variant="outline" className="text-xs">
                {content.title.length > 20 ? `${content.title.substring(0, 20)}...` : content.title}
              </Badge>
            ))}
            {selectedContents.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{selectedContents.length - 5} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!showConfirmDialog} onOpenChange={() => setShowConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirm {showConfirmDialog?.label}
            </DialogTitle>
            <DialogDescription>
              {showConfirmDialog?.confirmMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Selected content:</p>
              <div className="space-y-1">
                {selectedContents.slice(0, 3).map((content) => (
                  <p key={content.id} className="text-sm text-muted-foreground">
                    • {content.title}
                  </p>
                ))}
                {selectedContents.length > 3 && (
                  <p className="text-sm text-muted-foreground">
                    • ... and {selectedContents.length - 3} more
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowConfirmDialog(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => showConfirmDialog && executeBulkAction(showConfirmDialog)}
                disabled={actionLoading === showConfirmDialog?.id}
                variant={showConfirmDialog?.variant === 'destructive' ? 'destructive' : 'default'}
              >
                {actionLoading === showConfirmDialog?.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  showConfirmDialog?.label
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}