"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  User,
  Calendar,
  FileText,
  Image as ImageIcon,
  Video,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { approvalApi, contentApi } from "@/lib/mock-api";
import { Approval, Content } from "@/lib/types/aisam-types";
import { toast } from "sonner";

interface ContentApprovalsProps {
  onApprovalUpdate?: () => void;
}

interface ApprovalWithContent extends Approval {
  content?: Content;
  submitted_by?: string;
}

export function ContentApprovals({ onApprovalUpdate }: ContentApprovalsProps) {
  const [approvals, setApprovals] = useState<ApprovalWithContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalWithContent | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const response = await approvalApi.getApprovals();
      if (response.success) {
        // Enrich approvals with content data
        const enrichedApprovals = await Promise.all(
          response.data.map(async (approval) => {
            try {
              const contentsResponse = await contentApi.getContents();
              const content = contentsResponse.success
                ? contentsResponse.data.find(c => c.id === approval.content_id)
                : undefined;

              return {
                ...approval,
                content,
                submitted_by: "John Doe", // Mock submitter name
              };
            } catch (error) {
              console.error('Failed to load content for approval:', approval.id, error);
              return {
                ...approval,
                submitted_by: "Unknown User",
              };
            }
          })
        );

        setApprovals(enrichedApprovals);
      }
    } catch (error) {
      console.error('Failed to load approvals:', error);
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    if (!reviewNotes.trim()) {
      toast.error('Please add review notes before approving');
      return;
    }

    try {
      setProcessing(approvalId);
      const response = await approvalApi.approveContent(approvalId, reviewNotes);

      if (response.success) {
        toast.success('Content approved successfully!');
        setReviewNotes("");
        setSelectedApproval(null);
        loadApprovals();
        onApprovalUpdate?.();
      } else {
        toast.error('Failed to approve content');
      }
    } catch (error) {
      console.error('Failed to approve content:', error);
      toast.error('Failed to approve content');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (approvalId: string) => {
    if (!reviewNotes.trim()) {
      toast.error('Please add review notes explaining the rejection');
      return;
    }

    try {
      setProcessing(approvalId);
      const response = await approvalApi.rejectContent(approvalId, reviewNotes);

      if (response.success) {
        toast.success('Content rejected');
        setReviewNotes("");
        setSelectedApproval(null);
        loadApprovals();
        onApprovalUpdate?.();
      } else {
        toast.error('Failed to reject content');
      }
    } catch (error) {
      console.error('Failed to reject content:', error);
      toast.error('Failed to reject content');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAdTypeIcon = (adType: string) => {
    switch (adType) {
      case 'image_text':
        return <ImageIcon className="h-4 w-4" />;
      case 'video_text':
        return <Video className="h-4 w-4" />;
      case 'text_only':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const completedApprovals = approvals.filter(a => a.status !== 'pending');

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading approvals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve content submissions from your team
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {pendingApprovals.length} pending
          </Badge>
          <Badge variant="secondary">
            {completedApprovals.length} completed
          </Badge>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Pending Approvals ({pendingApprovals.length})
          </h2>

          {pendingApprovals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">
                    No pending approvals at the moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pendingApprovals.map((approval) => (
                <Card key={approval.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{approval.content?.title || 'Untitled Content'}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span>Submitted by {approval.submitted_by}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(approval.created_at).toLocaleDateString()}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(approval.status)}
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getAdTypeIcon(approval.content?.ad_type || 'text_only')}
                          {approval.content?.ad_type?.replace('_', ' ') || 'text only'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Content Preview */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      {approval.content?.text_content && (
                        <p className="text-sm mb-3">{approval.content.text_content}</p>
                      )}
                      {approval.content?.image_url && (
                        <img
                          src={approval.content.image_url}
                          alt="Content preview"
                          className="w-full max-w-sm h-auto rounded-lg mb-3"
                        />
                      )}
                      {approval.content?.video_url && (
                        <video
                          src={approval.content.video_url}
                          controls
                          className="w-full max-w-sm h-auto rounded-lg mb-3"
                        />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Review Content</DialogTitle>
                            <DialogDescription>
                              Review the content submission and provide your decision
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Content Details */}
                            <div className="bg-muted/50 rounded-lg p-4">
                              <h4 className="font-semibold mb-2">{approval.content?.title}</h4>
                              {approval.content?.text_content && (
                                <p className="text-sm mb-3">{approval.content.text_content}</p>
                              )}
                              {approval.content?.image_url && (
                                <img
                                  src={approval.content.image_url}
                                  alt="Content"
                                  className="w-full max-w-md h-auto rounded-lg mb-3"
                                />
                              )}
                              {approval.content?.video_url && (
                                <video
                                  src={approval.content.video_url}
                                  controls
                                  className="w-full max-w-md h-auto rounded-lg mb-3"
                                />
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Type: {approval.content?.ad_type?.replace('_', ' ')}</span>
                                <span>•</span>
                                <span>Submitted: {new Date(approval.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Review Notes */}
                            <div className="space-y-2">
                              <Label htmlFor="review-notes">Review Notes *</Label>
                              <Textarea
                                id="review-notes"
                                placeholder="Provide feedback or notes about your decision..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={4}
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                onClick={() => handleReject(approval.id)}
                                disabled={processing === approval.id || !reviewNotes.trim()}
                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                              >
                                {processing === approval.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleApprove(approval.id)}
                                disabled={processing === approval.id || !reviewNotes.trim()}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                {processing === approval.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApproval(approval)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Approvals */}
        {completedApprovals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completed Approvals ({completedApprovals.length})
            </h2>

            <div className="grid gap-4">
              {completedApprovals.slice(0, 5).map((approval) => (
                <Card key={approval.id} className="opacity-75">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{approval.content?.title || 'Untitled'}</p>
                          <p className="text-xs text-muted-foreground">
                            {approval.submitted_by} • {new Date(approval.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(approval.status)}
                        {approval.notes && (
                          <Badge variant="outline" className="text-xs">
                            Has notes
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}