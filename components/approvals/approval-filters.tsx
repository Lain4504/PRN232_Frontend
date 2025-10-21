"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { ContentStatusEnum } from "@/lib/types/aisam-types";

interface ApprovalFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ContentStatusEnum | "all";
  onStatusChange: (status: ContentStatusEnum | "all") => void;
  totalCount: number;
}

export function ApprovalFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  totalCount
}: ApprovalFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content, brand, or approver..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as ContentStatusEnum | "all")}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Status</option>
            <option value={ContentStatusEnum.PendingApproval}>Pending</option>
            <option value={ContentStatusEnum.Approved}>Approved</option>
            <option value={ContentStatusEnum.Rejected}>Rejected</option>
            <option value={ContentStatusEnum.Draft}>Draft</option>
            <option value={ContentStatusEnum.Published}>Published</option>
          </select>
          <Badge variant="secondary">
            {totalCount} approval{totalCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}