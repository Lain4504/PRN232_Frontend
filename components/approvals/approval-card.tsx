"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye,
  MessageSquare,
  Check,
  X,
  Clock,
  Trash2
} from "lucide-react";
import { ApprovalResponseDto, ContentStatusEnum } from "@/lib/types/aisam-types";

interface ApprovalCardProps {
  approval: ApprovalResponseDto;
  onReview: (approval: ApprovalResponseDto) => void;
  onApprove?: (approvalId: string) => void;
  onReject?: (approvalId: string) => void;
  onDelete?: (approval: ApprovalResponseDto) => void;
  isProcessing?: boolean;
}

export function ApprovalCard({ 
  approval, 
  onReview, 
  onApprove, 
  onReject, 
  onDelete,
  isProcessing = false 
}: ApprovalCardProps) {
  const getStatusBadge = (status: ContentStatusEnum) => {
    switch (status) {
      case ContentStatusEnum.PendingApproval:
        return <Badge variant="outline" className="border-chart-4 text-chart-4">Pending</Badge>;
      case ContentStatusEnum.Approved:
        return <Badge variant="default" className="bg-chart-2">Approved</Badge>;
      case ContentStatusEnum.Rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      case ContentStatusEnum.Draft:
        return <Badge variant="secondary">Draft</Badge>;
      case ContentStatusEnum.Published:
        return <Badge variant="default" className="bg-green-600">Published</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusBadge(approval.status)}
              <Badge variant="outline">Content</Badge>
            </div>
            <CardTitle className="text-lg">{approval.contentTitle || 'Unknown Content'}</CardTitle>
            <CardDescription>
              {approval.brandName || 'Unknown Brand'} • {new Date(approval.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onReview(approval)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Review
            </Button>
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(approval)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Submitted {new Date(approval.createdAt).toLocaleDateString()}</span>
            </div>
            {approval.notes && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>Has notes</span>
              </div>
            )}
            {approval.approverEmail && (
              <div className="flex items-center gap-1">
                <span>Approver: {approval.approverEmail}</span>
              </div>
            )}
          </div>
          
          {approval.status === ContentStatusEnum.PendingApproval && onApprove && onReject && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onApprove(approval.id)}
                disabled={isProcessing}
                className="bg-chart-2 hover:bg-chart-2/90"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(approval.id)}
                disabled={isProcessing}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}