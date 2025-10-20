"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  BarChart3, 
  ExternalLink, 
  Calendar, 
  Clock,
  Heart,
  Share,
  MessageCircle,
  TrendingUp
} from "lucide-react";
import { 
  SiFacebook, 
  SiInstagram, 
  SiX, 
  SiYoutube, 
  SiTiktok 
} from "@icons-pack/react-simple-icons";
import { useContent } from "@/hooks/use-contents";
import { useGetSocialAccounts } from "@/hooks/use-social-accounts";
import { PostStatusBadge } from "./post-status-badge";
import { PostMetrics } from "./post-metrics";
import type { Post } from "@/lib/types/aisam-types";
import Link from "next/link";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { data: content } = useContent(post.content_id);
  const { data: socialAccounts } = useGetSocialAccounts();

  // Find the social integration for this post
  const socialIntegration = socialAccounts?.flatMap(account => 
    account.targets?.filter(target => target.id === post.social_integration_id) || []
  )?.[0];

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'facebook':
        return <SiFacebook className="h-4 w-4" color="#1877F2" />;
      case 'instagram':
        return <SiInstagram className="h-4 w-4" color="#E4405F" />;
      case 'twitter':
      case 'x':
        return <SiX className="h-4 w-4" color="#000000" />;
      case 'youtube':
        return <SiYoutube className="h-4 w-4" color="#FF0000" />;
      case 'tiktok':
        return <SiTiktok className="h-4 w-4" color="#000000" />;
      default:
        return <Share className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDate(post.published_at);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              {getPlatformIcon(socialIntegration?.provider || 'unknown')}
            </div>
            <div>
              <CardTitle className="text-lg">{content?.title || 'Unknown Content'}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{socialIntegration?.provider || 'Unknown Platform'}</span>
                <span>•</span>
                <span>{date}</span>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <PostStatusBadge status={post.status} />
            <Button variant="ghost" size="sm" asChild>
              <Link href={post.external_post_id ? `https://${socialIntegration?.provider}.com/posts/${post.external_post_id}` : '#'} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {content?.textContent && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {content.textContent}
          </p>
        )}
        
        {/* Performance Metrics */}
        {post.metrics && (
          <PostMetrics metrics={post.metrics} />
        )}
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Published {date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{time}</span>
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
}
