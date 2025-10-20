"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, BarChart3 } from "lucide-react";
import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "./post-card";
import { PostsFilters } from "./posts-filters";
import type { PostFilters } from "@/lib/types/aisam-types";
import Link from "next/link";

interface PostsListProps {
  filters?: PostFilters;
  showFilters?: boolean;
  onFiltersChange?: (filters: PostFilters) => void;
}

export function PostsList({ filters, showFilters = true, onFiltersChange }: PostsListProps) {
  const { data: postsData, isLoading, error } = usePosts(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showFilters && <PostsFilters filters={filters} onFiltersChange={onFiltersChange} />}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-16 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {showFilters && <PostsFilters filters={filters} onFiltersChange={onFiltersChange} />}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Posts</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading your posts. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const posts = postsData?.data || [];
  const totalCount = postsData?.totalCount || 0;

  return (
    <div className="space-y-6">
      {showFilters && (
        <PostsFilters 
          filters={filters} 
          onFiltersChange={onFiltersChange}
          totalCount={totalCount}
        />
      )}

      {posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {filters && Object.keys(filters).length > 0 ? 'No posts found' : 'No posts yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {filters && Object.keys(filters).length > 0
                  ? 'Try adjusting your search terms or filters'
                  : 'Your published posts will appear here'
                }
              </p>
              {(!filters || Object.keys(filters).length === 0) && (
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
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
