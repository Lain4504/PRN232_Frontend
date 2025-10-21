"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, TrendingUp } from "lucide-react";
import { useContents } from "@/hooks/use-contents";
import { ContentStatusEnum } from "@/lib/types/aisam-types";
import Link from "next/link";

interface ContentStatusWidgetProps {
  brandId?: string;
  limit?: number;
  showViewAll?: boolean;
}

export function ContentStatusWidget({ 
  brandId,
  limit = 5, 
  showViewAll = true 
}: ContentStatusWidgetProps) {
  const { data: contentsData, isLoading } = useContents({
    brandId,
    page: 1,
    pageSize: limit,
    sortBy: 'createdAt',
    sortDescending: true,
  });

  const contents = contentsData?.data || [];

  // Calculate status counts
  const statusCounts = contents.reduce((acc, content) => {
    acc[content.status] = (acc[content.status] || 0) + 1;
    return acc;
  }, {} as Record<ContentStatusEnum, number>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Overview
          </CardTitle>
          <CardDescription>Recent content activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Overview
            </CardTitle>
            <CardDescription>Recent content activity</CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {contents.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {contents.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No content available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Summary */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-xs font-medium">
                    {status === ContentStatusEnum.PendingApproval ? 'Pending' : status}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Recent Content */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Content</h4>
              {contents.slice(0, 3).map((content) => (
                <div key={content.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {content.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {content.brandName} • {new Date(content.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        content.status === ContentStatusEnum.Published ? "default" :
                        content.status === ContentStatusEnum.Approved ? "secondary" :
                        content.status === ContentStatusEnum.PendingApproval ? "outline" :
                        "destructive"
                      }
                      className="text-xs"
                    >
                      {content.status === ContentStatusEnum.PendingApproval ? 'Pending' : content.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={brandId ? `/dashboard/brands/${brandId}/contents` : `/dashboard/contents`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showViewAll && contents.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={brandId ? `/dashboard/brands/${brandId}/contents` : `/dashboard/contents`}>
                <TrendingUp className="mr-2 h-4 w-4" />
                View All Content
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}