"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, AlertCircle } from "lucide-react";
import { usePendingApprovals } from "@/hooks/use-approvals";
import { ContentStatusEnum } from "@/lib/types/aisam-types";
import Link from "next/link";

interface PendingApprovalsWidgetProps {
  limit?: number;
  showViewAll?: boolean;
}

export function PendingApprovalsWidget({ 
  limit = 5, 
  showViewAll = true 
}: PendingApprovalsWidgetProps) {
  const { data: pendingApprovalsData, isLoading } = usePendingApprovals(1, limit);
  const approvals = pendingApprovalsData?.data || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Pending Approvals
          </CardTitle>
          <CardDescription>Content waiting for approval</CardDescription>
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
              <AlertCircle className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Content waiting for approval</CardDescription>
          </div>
          <Badge variant="secondary" className="text-sm">
            {approvals.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approvals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {approval.contentTitle || 'Unknown Content'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {approval.brandName || 'Unknown Brand'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/approvals?id=${approval.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {showViewAll && approvals.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/dashboard/approvals">
                View All Approvals
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}