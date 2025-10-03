"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Eye,
  Calendar,
  Send,
  Clock,
  Image,
  Video,
  Type
} from "lucide-react";
import { contentApi, brandApi } from "@/lib/mock-api";
import { Content, Brand } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import Link from "next/link";

export function ContentsManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        
        // Get brands
        const brandsResponse = await brandApi.getBrands();
        if (brandsResponse.success) {
          setBrands(brandsResponse.data);
        }
        
        // Get contents
        const contentsResponse = await contentApi.getContents();
        if (contentsResponse.success) {
          setContents(contentsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load contents data:', error);
        toast.error('Failed to load contents data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.text_content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || content.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'pending_approval':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-blue-600">Published</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAdTypeIcon = (adType: string) => {
    switch (adType) {
      case 'image_text':
        return <Image className="h-4 w-4" />;
      case 'video_text':
        return <Video className="h-4 w-4" />;
      case 'text_only':
        return <Type className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleSubmitForApproval = async (contentId: string) => {
    try {
      const response = await contentApi.submitForApproval(contentId);
      if (response.success) {
        setContents(contents.map(c => c.id === contentId ? response.data : c));
        toast.success('Content submitted for approval');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to submit for approval:', error);
      toast.error('Failed to submit for approval');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contents...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">
            Create and manage your content with AI assistance
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/contents/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Content
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contents..."
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
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>
            <Badge variant="secondary">
              {filteredContents.length} content{filteredContents.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Contents Grid */}
      {filteredContents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== "all" ? 'No contents found' : 'No contents yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? 'Try adjusting your search terms or filters'
                  : 'Create your first content to get started with AISAM'
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/dashboard/contents/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Content
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredContents.map((content) => {
            const brand = brands.find(b => b.id === content.brand_id);
            
            return (
              <Card key={content.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getAdTypeIcon(content.ad_type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg line-clamp-1">{content.title}</CardTitle>
                        <CardDescription>
                          {brand?.name || 'Unknown Brand'}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/contents/${content.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/contents/${content.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(content.status)}
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getAdTypeIcon(content.ad_type)}
                      {content.ad_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {content.text_content && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {content.text_content}
                    </p>
                  )}
                  
                  {content.image_url && (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(content.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {content.status === 'draft' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSubmitForApproval(content.id)}
                        className="flex-1"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Submit for Approval
                      </Button>
                    )}
                    {content.status === 'approved' && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/dashboard/calendar?content=${content.id}`}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule
                        </Link>
                      </Button>
                    )}
                    {content.status === 'pending_approval' && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <Clock className="h-4 w-4" />
                        <span>Awaiting approval</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
