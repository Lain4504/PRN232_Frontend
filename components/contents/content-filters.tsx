"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { ContentStatusEnum, AdTypeEnum } from "@/lib/types/aisam-types";

interface ContentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ContentStatusEnum | "all";
  onStatusChange: (status: ContentStatusEnum | "all") => void;
  adTypeFilter: AdTypeEnum | "all";
  onAdTypeChange: (adType: AdTypeEnum | "all") => void;
  brandFilter: string;
  onBrandChange: (brandId: string) => void;
  totalCount: number;
  onCreateNew?: () => void;
  brands?: Array<{ id: string; name: string }>;
}

export function ContentFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  adTypeFilter,
  onAdTypeChange,
  brandFilter,
  onBrandChange,
  totalCount,
  onCreateNew,
  brands = []
}: ContentFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content, title, or description..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={brandFilter}
            onChange={(e) => {
              console.log('Brand filter changed to:', e.target.value); // Debug log
              onBrandChange(e.target.value);
            }}
            className="px-3 py-2 border rounded-md min-w-[120px]"
          >
            <option value="">All Brands ({brands.length} available)</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as ContentStatusEnum | "all")}
            className="px-3 py-2 border rounded-md min-w-[120px]"
          >
            <option value="all">All Status</option>
            <option value={ContentStatusEnum.Draft}>Draft</option>
            <option value={ContentStatusEnum.PendingApproval}>Pending Approval</option>
            <option value={ContentStatusEnum.Approved}>Approved</option>
            <option value={ContentStatusEnum.Rejected}>Rejected</option>
            <option value={ContentStatusEnum.Published}>Published</option>
          </select>
          
          <select
            value={adTypeFilter}
            onChange={(e) => onAdTypeChange(e.target.value === "all" ? "all" : parseInt(e.target.value) as AdTypeEnum)}
            className="px-3 py-2 border rounded-md min-w-[120px]"
          >
            <option value="all">All Types</option>
            <option value={AdTypeEnum.TextOnly}>Text Only</option>
            <option value={AdTypeEnum.ImageText}>Image + Text</option>
            <option value={AdTypeEnum.VideoText}>Video + Text</option>
          </select>
          
          <Badge variant="secondary">
            {totalCount} content{totalCount !== 1 ? 's' : ''}
          </Badge>
          
          {onCreateNew && (
            <Button onClick={onCreateNew} className="ml-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Content
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}