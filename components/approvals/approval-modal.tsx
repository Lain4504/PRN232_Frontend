"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, X, Loader2 } from "lucide-react";
import { ApprovalResponseDto, ContentStatusEnum } from "@/lib/types/aisam-types";
import { useSocialIntegrations } from "@/hooks/use-social-integrations";
import { usePublishContent } from "@/hooks/use-contents";
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

  // Get social integrations for publishing
  const { data: integrations = [], isLoading: integrationsLoading } = useSocialIntegrations(
    approval?.brandId || approval?.content?.brandId || ""
  );

  const publishContentMutation = usePublishContent(approval?.contentId || "");

  if (!approval) return null;

  const handleApprove = async () => {
    await onApprove(notes);
    setNotes("");
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    await onReject(notes);
    setNotes("");
  };

  const handlePublish = async () => {
    if (!approval || !selectedIntegrationId) return;
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {approval.status === ContentStatusEnum.PendingApproval 
                ? "Review Content" 
                : "Content Approved - Ready to Publish"
              }
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{approval.contentTitle}</h3>
              <p className="text-muted-foreground">{approval.brandName}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Approver</Label>
              <p className="text-sm text-muted-foreground mt-1">{approval.approverEmail}</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Status</Label>
              <p className="text-sm text-muted-foreground mt-1">{approval.status}</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Submitted</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(approval.createdAt).toLocaleDateString()} at {new Date(approval.createdAt).toLocaleTimeString()}
              </p>
            </div>

            {approval.notes && (
              <div>
                <Label className="text-sm font-medium">Existing Notes</Label>
                <div className="p-4 bg-muted rounded-lg mt-2">
                  <p className="text-sm whitespace-pre-wrap">{approval.notes}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="approval-notes">
              {approval.status === ContentStatusEnum.PendingApproval ? 'Approval Notes' : 'Additional Notes'}
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
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 bg-chart-2 hover:bg-chart-2/90"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve Content
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Reject Content
              </Button>
            </div>
          )}

          {approval.status === ContentStatusEnum.Approved && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Social Integration</Label>
                {integrationsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading integrations...</span>
                  </div>
                ) : integrations.length === 0 ? (
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">No social integrations available for this brand.</p>
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedIntegrationId}
                    onValueChange={setSelectedIntegrationId}
                    className="space-y-2"
                  >
                    {integrations.map((integration) => (
                      <div key={integration.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={integration.id} id={integration.id} />
                        <Label htmlFor={integration.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{integration.name}</span>
                            <span className="text-sm text-muted-foreground">{integration.platform}</span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handlePublish}
                  disabled={!selectedIntegrationId || isPublishing || integrations.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                >
                  Publish Later
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}