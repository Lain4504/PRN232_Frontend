"use client";

import React, { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Loader2 } from "lucide-react";
import { ApprovalResponseDto, ContentStatusEnum } from "@/lib/types/aisam-types";
import { useSocialIntegrations } from "@/hooks/use-social-integrations";
import { usePublishContent, useContent } from "@/hooks/use-contents";
import { ContentPreviewView } from "@/components/contents/content-preview-view";
import { toast } from "sonner";

interface ApprovalModalProps {
  approval: ApprovalResponseDto | null;
  onClose: () => void;
  onApprove: (notes: string) => Promise<void>;
  onReject: (notes: string) => Promise<void>;
  onPublishComplete?: () => void;
  isProcessing?: boolean;
}

export function ApprovalModal({ 
  approval, 
  onClose, 
  onApprove, 
  onReject, 
  onPublishComplete,
  isProcessing = false 
}: ApprovalModalProps) {
  const [notes, setNotes] = useState("");
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Use content from approval if available, otherwise fetch it
  const approvalContent = approval?.content;
  const { data: fetchedContent, isLoading: contentLoading } = useContent(
    approvalContent ? undefined : approval?.contentId
  );
  const content = approvalContent || fetchedContent;

  // Get social integrations for publishing
  const { data: integrations = [], isLoading: integrationsLoading } = useSocialIntegrations(
    approval?.brandId || approval?.content?.brandId || content?.brandId || ""
  );

  const publishContentMutation = usePublishContent(approval?.contentId || "");

  if (!approval) return null;

  const handleApprove = async () => {
    try {
      await onApprove(notes);
      setNotes("");
      onClose(); // Close modal after successful approval
    } catch (error) {
      // Error handling is done in parent component
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await onReject(notes);
      setNotes("");
      onClose(); // Close modal after successful rejection
    } catch (error) {
      // Error handling is done in parent component
      console.error('Failed to reject:', error);
    }
  };

  const handlePublish = async () => {
    if (!approval || !selectedIntegrationId || !content) return;
    setIsPublishing(true);
    try {
      await publishContentMutation.mutateAsync(selectedIntegrationId);
      toast.success("Content published successfully!");
      onPublishComplete?.();
      onClose();
    } catch (error) {
      console.error("Failed to publish content:", error);
      toast.error("Failed to publish content.");
    } finally {
      setIsPublishing(false);
    }
  };

  const modalContent = (
    <>
      {/* Approval Info Section */}
      <div className="space-y-4 border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Review Content</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">{approval.brandName}</Badge>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">Approver: {approval.approverEmail}</span>
            </div>
          </div>
        </div>

        {approval.notes && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Submission Notes</Label>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{approval.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Preview */}
      {contentLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Loading content...</span>
        </div>
      ) : content ? (
        <ContentPreviewView
          content={content}
          showActions={false}
        />
      ) : approval?.contentId ? (
        <div className="text-center p-8 text-muted-foreground">
          <p>Content is being loaded. If this persists, please refresh the page.</p>
          <p className="text-xs mt-2">Content ID: {approval.contentId}</p>
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          <p>Content information is not available.</p>
        </div>
      )}

      {/* Approval Actions */}
      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <Label htmlFor="approval-notes">
            {approval.status === ContentStatusEnum.PendingApproval ? 'Approval Notes (Optional)' : 'Additional Notes'}
          </Label>
          <Textarea
            id="approval-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              approval.status === ContentStatusEnum.PendingApproval 
                ? "Add notes for the content creator..." 
                : "Add additional notes..."
            }
            rows={3}
          />
        </div>

        {approval.status === ContentStatusEnum.PendingApproval && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleApprove}
              disabled={isProcessing || contentLoading}
              className="w-full bg-chart-2 hover:bg-chart-2/90"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve Content
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || contentLoading}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Reject Content
            </Button>
          </div>
        )}

        {approval.status === ContentStatusEnum.Approved && content && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Social Integration</Label>
              {integrationsLoading ? (
                <div className="flex items-center justify-center p-4 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading integrations...</span>
                </div>
              ) : integrations.length === 0 ? (
                <div className="p-4 bg-muted rounded-md text-center">
                  <p className="text-sm text-muted-foreground">No social integrations available for this brand.</p>
                </div>
              ) : (
                <Select
                  value={selectedIntegrationId}
                  onValueChange={setSelectedIntegrationId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an integration..." />
                  </SelectTrigger>
                  <SelectContent>
                    {integrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{integration.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{integration.platform}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={handlePublish}
                disabled={!selectedIntegrationId || isPublishing || integrations.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Publish Content
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isPublishing}
                className="w-full"
              >
                Publish Later
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={!!approval} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {approval.status === ContentStatusEnum.PendingApproval 
                ? "Review Content" 
                : "Content Approved - Ready to Publish"
              }
            </DialogTitle>
            <DialogDescription>
              Review content details, images, and videos before approval
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {modalContent}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={!!approval} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>
            {approval.status === ContentStatusEnum.PendingApproval 
              ? "Review Content" 
              : "Content Approved - Ready to Publish"
            }
          </DrawerTitle>
          <DrawerDescription>
            Review content details, images, and videos before approval
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4">
          {modalContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}