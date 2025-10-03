"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Search, 
  Eye,
  Calendar,
  BarChart3,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share,
  Linkedin
} from "lucide-react";
import { 
  SiFacebook, 
  SiInstagram, 
  SiX, 
  SiYoutube, 
  SiTiktok 
} from "@icons-pack/react-simple-icons";
import { authApi, postApi, contentApi, socialIntegrationApi } from "@/lib/mock-api";
import { User, Post, Content, SocialIntegration } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import Link from "next/link";

export function PostsManagement() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [socialIntegrations, setSocialIntegrations] = useState<SocialIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        }
        
        // Get posts
        const postsResponse = await postApi.getPosts();
        if (postsResponse.success) {
          setPosts(postsResponse.data);
        }
        
        // Get contents
        const contentsResponse = await contentApi.getContents();
        if (contentsResponse.success) {
          setContents(contentsResponse.data);
        }
        
        // Get social integrations
        const integrationsResponse = await socialIntegrationApi.getSocialIntegrations();
        if (integrationsResponse.success) {
          setSocialIntegrations(integrationsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load posts data:', error);
        toast.error('Failed to load posts data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredPosts = posts.filter(post => {
    const content = contents.find(c => c.id === post.content_id);
    const matchesSearch = content?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content?.text_content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-600">Published</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'deleted':
        return <Badge variant="secondary">Deleted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <SiFacebook className="h-4 w-4" color="#1877F2" />;
      case 'instagram':
        return <SiInstagram className="h-4 w-4" color="#E4405F" />;
      case 'twitter':
        return <SiX className="h-4 w-4" color="#000000" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" color="#0A66C2" />;
      case 'youtube':
        return <SiYoutube className="h-4 w-4" color="#FF0000" />;
      case 'tiktok':
        return <SiTiktok className="h-4 w-4" color="#000000" />;
      default:
        return <Share className="h-4 w-4" />;
    }
  };

  // Mock performance data
  const getMockPerformance = (postId: string) => {
    return {
      impressions: Math.floor(Math.random() * 10000) + 1000,
      engagement: Math.floor(Math.random() * 500) + 50,
      clicks: Math.floor(Math.random() * 200) + 10,
      ctr: (Math.random() * 5 + 1).toFixed(2)
    };
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading posts...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Published Posts</h1>
          <p className="text-muted-foreground">
            View and analyze your published content performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
              <option value="deleted">Deleted</option>
            </select>
            <Badge variant="secondary">
              {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== "all" ? 'No posts found' : 'No posts yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? 'Try adjusting your search terms or filters'
                  : 'Your published posts will appear here'
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/dashboard/contents">
                    <Send className="mr-2 h-4 w-4" />
                    Create Content
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const content = contents.find(c => c.id === post.content_id);
            const integration = socialIntegrations.find(s => s.id === post.social_integration_id);
            const performance = getMockPerformance(post.id);
            
            return (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getPlatformIcon(integration?.platform || 'unknown')}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{content?.title || 'Unknown Content'}</CardTitle>
                        <CardDescription>
                          {integration?.platform || 'Unknown Platform'} • {new Date(post.published_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(post.status)}
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
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
                  
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Impressions</span>
                      </div>
                      <div className="text-lg font-bold">{performance.impressions.toLocaleString()}</div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Heart className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Engagement</span>
                      </div>
                      <div className="text-lg font-bold">{performance.engagement.toLocaleString()}</div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Clicks</span>
                      </div>
                      <div className="text-lg font-bold">{performance.clicks.toLocaleString()}</div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">CTR</span>
                      </div>
                      <div className="text-lg font-bold">{performance.ctr}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Published {new Date(post.published_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(post.published_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/posts/${post.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/reports?post=${post.id}`}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </Link>
                      </Button>
                    </div>
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
