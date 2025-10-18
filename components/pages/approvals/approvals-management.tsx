"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  Search, 
  Eye,
  MessageSquare,
  Check,
  X,
  Clock
} from "lucide-react";
import { approvalApi, contentApi } from "@/lib/mock-api";
import { useBrands } from "@/hooks/use-brands";
import { Approval, Content, Brand } from "@/lib/types/aisam-types";
import { toast } from "sonner";

export function ApprovalsManagement() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  // Hooks
  const { data: brands = [] } = useBrands();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        
        // Get approvals
        const approvalsResponse = await approvalApi.getApprovals();
        if (approvalsResponse.success) {
          setApprovals(approvalsResponse.data);
        }
        
        // Get contents
        const contentsResponse = await contentApi.getContents();
        if (contentsResponse.success) {
          setContents(contentsResponse.data);
        }
        
        // Brands are loaded via hook
      } catch (error) {
        console.error('Failed to load approvals data:', error);
        toast.error('Failed to load approvals data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredApprovals = approvals.filter(approval => {
    const content = contents.find(c => c.id === approval.content_id);
    const matchesSearch = content?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content?.text_content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || approval.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-chart-4 text-chart-4">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-chart-2">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleApprove = async (approvalId: string) => {
    try {
      setProcessing(approvalId);
      const response = await approvalApi.approveContent(approvalId, approvalNotes);
      if (response.success) {
        setApprovals(approvals.map(a => a.id === approvalId ? { ...a, status: 'approved' as const } : a));
        setSelectedApproval(null);
        setApprovalNotes("");
        toast.success('Content approved successfully');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to approve content:', error);
      toast.error('Failed to approve content');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (approvalId: string) => {
    if (!approvalNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(approvalId);
      const response = await approvalApi.rejectContent(approvalId, approvalNotes);
      if (response.success) {
        setApprovals(approvals.map(a => a.id === approvalId ? { ...a, status: 'rejected' as const } : a));
        setSelectedApproval(null);
        setApprovalNotes("");
        toast.success('Content rejected');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to reject content:', error);
      toast.error('Failed to reject content');
    } finally {
      setProcessing(null);
    }
  };

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
            Review and approve content before publishing
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {approvals.filter(a => a.status === 'pending').length} Pending
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Badge variant="secondary">
              {filteredApprovals.length} approval{filteredApprovals.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Approvals List */}
      {filteredApprovals.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== "all" ? 'No approvals found' : 'All caught up!'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? 'Try adjusting your search terms or filters'
                  : 'There are no pending approvals at the moment'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => {
            const content = contents.find(c => c.id === approval.content_id);
            const brand = content ? brands.find(b => b.id === content.brand_id) : null;
            
            return (
              <Card key={approval.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(approval.status)}
                        <Badge variant="outline">
                          {content?.ad_type?.replace('_', ' ') || 'Content'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{content?.title || 'Unknown Content'}</CardTitle>
                      <CardDescription>
                        {brand?.name || 'Unknown Brand'} • {new Date(approval.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedApproval(approval)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {content?.text_content && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {content.text_content}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Submitted {new Date(approval.created_at).toLocaleDateString()}</span>
                      </div>
                      {approval.notes && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>Has notes</span>
                        </div>
                      )}
                    </div>
                    
                    {approval.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(approval.id)}
                          disabled={processing === approval.id}
                          className="bg-chart-2 hover:bg-chart-2/90"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(approval.id)}
                          disabled={processing === approval.id}
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
          })}
        </div>
      )}

      {/* Approval Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Review Content</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedApproval(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const content = contents.find(c => c.id === selectedApproval.content_id);
                const brand = content ? brands.find(b => b.id === content.brand_id) : null;
                
                return (
                  <>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{content?.title}</h3>
                        <p className="text-muted-foreground">{brand?.name}</p>
                      </div>
                      
                      {content?.text_content && (
                        <div>
                          <Label className="text-sm font-medium">Content</Label>
                          <div className="p-4 bg-muted rounded-lg mt-2">
                            <p className="text-sm whitespace-pre-wrap">{content.text_content}</p>
                          </div>
                        </div>
                      )}
                      
                      {content?.image_url && (
                        <div>
                          <Label className="text-sm font-medium">Image</Label>
                          <div className="mt-2 p-4 bg-muted rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Image preview would be here</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="approval-notes">Approval Notes</Label>
                      <Textarea
                        id="approval-notes"
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Add notes for the content creator..."
                        rows={3}
                      />
                    </div>
                    
                    {selectedApproval.status === 'pending' && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(selectedApproval.id)}
                          disabled={processing === selectedApproval.id}
                          className="flex-1 bg-chart-2 hover:bg-chart-2/90"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve Content
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(selectedApproval.id)}
                          disabled={processing === selectedApproval.id}
                          className="flex-1"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject Content
                        </Button>
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
