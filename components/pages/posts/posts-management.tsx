"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { PostsList } from "@/components/posts/posts-list";
import type { PostFilters } from "@/lib/types/aisam-types";
import Link from "next/link";

export function PostsManagement() {
  const [filters, setFilters] = useState<PostFilters>({});

  const handleFiltersChange = (newFilters: PostFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Published Posts</h1>
          <p className="text-muted-foreground">
            View and analyze your published social media posts
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

      {/* Posts List with Filters */}
      <PostsList 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        showFilters={true}
      />
      </div>
    </div>
  );
}