"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Eye,
  Edit,
  Send,
  Calendar,
  BarChart3,
  Share2,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  Archive,
  RotateCcw,
} from "lucide-react";
import { contentApi } from "@/lib/mock-api";
import { Content } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import Link from "next/link";
import { ContentEditor } from "./content-editor";
import { ContentPublisher } from "./content-publisher";
import { ContentPerformance } from "./content-performance";

interface ContentDetailProps {
  contentId: string;
  onUpdate?: () => void;
}

export function ContentDetail({ contentId, onUpdate }: ContentDetailProps) {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [showPublisher, setShowPublisher] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, [contentId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await contentApi.getContents();
      if (response.success) {
        const foundContent = response.data.find(c => c.id === contentId);
        if (foundContent) {
          setContent(foundContent);
        }
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!content) return;

    try {
      setActionLoading('submit');
      const response = await contentApi.submitForApproval(content.id);
      if (response.success) {
        setContent(response.data);
        toast.success('Content submitted for approval');
        onUpdate?.();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to submit for approval:', error);
      toast.error('Failed to submit for approval');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async () => {
    setShowPublisher(true);
  };

  const handleSchedule = async () => {
    setShowPublisher(true);
  };

  const handleCopyContent = () => {
    if (!content?.text_content) return;

    navigator.clipboard.writeText(content.text_content);
    toast.success('Content copied to clipboard');
  };

  const handleArchive = async () => {
    // Mock archive functionality
    toast.success('Content archived successfully');
    onUpdate?.();
  };

  const handleRestore = async () => {
    // Mock restore functionality
    toast.success('Content restored successfully');
    onUpdate?.();
  };

  const handleDelete = async () => {
    // Mock delete functionality
    toast.success('Content deleted successfully');
    onUpdate?.();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'pending_approval':
        return <Badge variant="outline" className="border-yellow-200 text-yellow-700">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Published</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAdTypeIcon = (adType: string) => {
    switch (adType) {
      case 'image_text':
        return <Share2 className="h-4 w-4" />;
      case 'video_text':
        return <Share2 className="h-4 w-4" />;
      case 'text_only':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading content details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Content not found</h3>
          <p className="text-muted-foreground mb-4">
            The content does not exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/dashboard/contents">Back to Contents</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/contents">
              <Eye className="h-4 w-4 mr-2" />
              Back to Contents
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{content.title}</h1>
            <p className="text-muted-foreground">
              Content details and management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(content.status)}
          <Badge variant="outline" className="flex items-center gap-1">
            {getAdTypeIcon(content.ad_type)}
            {content.ad_type.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Content Preview</CardTitle>
              <CardDescription>
                How your content appears to audiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold mb-3">{content.title}</h4>

                {content.text_content && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {content.text_content}
                  </p>
                )}

                {content.image_url && (
                  <img
                    src={content.image_url}
                    alt="Content"
                    className="w-full max-w-md h-auto rounded-lg mb-3"
                  />
                )}

                {content.video_url && (
                  <video
                    src={content.video_url}
                    controls
                    className="w-full max-w-md h-auto rounded-lg mb-3"
                  />
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>Created {new Date(content.created_at).toLocaleDateString()}</span>
                  {content.updated_at !== content.created_at && (
                    <>
                      <span>•</span>
                      <span>Updated {new Date(content.updated_at).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Details */}
          <Card>
            <CardHeader>
              <CardTitle>Content Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(content.status)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Content Type</label>
                  <div className="mt-1">
                    <Badge variant="outline">{content.ad_type.replace('_', ' ')}</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <div className="mt-1 text-sm">
                    {new Date(content.created_at).toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <div className="mt-1 text-sm">
                    {new Date(content.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {content.style_context_character && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Style Context</label>
                  <div className="mt-1 text-sm">{content.style_context_character}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Tab */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Performance Overview</h3>
                    <p className="text-muted-foreground mb-4">
                      {content.status === 'published'
                        ? 'View detailed analytics and engagement metrics'
                        : 'Content performance metrics will be available after publishing'
                      }
                    </p>
                    {content.status === 'published' && (
                      <Button onClick={() => setShowPerformance(true)}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Performance
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              {content.status === 'published' ? (
                <ContentPerformance contentId={content.id} />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
                      <p className="text-muted-foreground">
                        Performance metrics will be available once this content is published.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content History</CardTitle>
                  <CardDescription>
                    Timeline of changes and actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Content created</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(content.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {content.updated_at !== content.created_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Content updated</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(content.updated_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {content.status === 'published' && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Content published</p>
                          <p className="text-xs text-muted-foreground">
                            Status changed to published
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setShowEditor(true)}
                className="w-full justify-start"
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Content
              </Button>

              {content.status === 'draft' && (
                <Button
                  onClick={handleSubmitForApproval}
                  disabled={actionLoading === 'submit'}
                  className="w-full justify-start"
                  variant="outline"
                >
                  {actionLoading === 'submit' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit for Approval
                </Button>
              )}

              {content.status === 'approved' && (
                <Button
                  onClick={handlePublish}
                  className="w-full justify-start"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publish Now
                </Button>
              )}

              <Button
                onClick={handleCopyContent}
                variant="outline"
                className="w-full justify-start"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Content
              </Button>
            </CardContent>
          </Card>

          {/* Publishing Options */}
          {(content.status === 'approved' || content.status === 'published') && (
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handlePublish}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publish to Platforms
                </Button>

                <Button
                  onClick={handleSchedule}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Post
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-orange-600 hover:text-orange-700">
                    <Archive className="mr-2 h-4 w-4" />
                    Archive Content
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Archive Content</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to archive this content? It will be hidden from your main content list but can be restored later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => {}}>Cancel</Button>
                    <Button onClick={handleArchive} className="bg-orange-600 hover:bg-orange-700">
                      Archive
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Content
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Content</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to permanently delete this content? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => {}}>Cancel</Button>
                    <Button onClick={handleDelete} variant="destructive">
                      Delete
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <ContentEditor
            contentId={content.id}
            onSave={(updatedContent) => {
              setContent(updatedContent);
              setShowEditor(false);
              onUpdate?.();
            }}
            onCancel={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPublisher} onOpenChange={setShowPublisher}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Publish Content</DialogTitle>
            <DialogDescription>
              Choose platforms and schedule your content
            </DialogDescription>
          </DialogHeader>
          <ContentPublisher
            content={content}
            onPublish={() => {
              setShowPublisher(false);
              loadContent();
              onUpdate?.();
            }}
            onSchedule={() => {
              setShowPublisher(false);
              loadContent();
              onUpdate?.();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPerformance} onOpenChange={setShowPerformance}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Content Performance</DialogTitle>
            <DialogDescription>
              Detailed analytics and engagement metrics
            </DialogDescription>
          </DialogHeader>
          <ContentPerformance contentId={content.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
}