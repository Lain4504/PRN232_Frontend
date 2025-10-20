"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";
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
    <Card className="border border-muted/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Filters & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>
          
          {/* Brand Filter */}
          <Select value={brandFilter} onValueChange={onBrandChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={`All Brands (${brands.length})`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands ({brands.length} available)</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={ContentStatusEnum.Draft}>Draft</SelectItem>
              <SelectItem value={ContentStatusEnum.PendingApproval}>Pending Approval</SelectItem>
              <SelectItem value={ContentStatusEnum.Approved}>Approved</SelectItem>
              <SelectItem value={ContentStatusEnum.Rejected}>Rejected</SelectItem>
              <SelectItem value={ContentStatusEnum.Published}>Published</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Ad Type Filter */}
          <Select 
            value={adTypeFilter === "all" ? "all" : adTypeFilter.toString()} 
            onValueChange={(value) => onAdTypeChange(value === "all" ? "all" : parseInt(value) as AdTypeEnum)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={AdTypeEnum.TextOnly.toString()}>Text Only</SelectItem>
              <SelectItem value={AdTypeEnum.ImageText.toString()}>Image + Text</SelectItem>
              <SelectItem value={AdTypeEnum.VideoText.toString()}>Video + Text</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <Badge variant="secondary" className="text-xs">
            {totalCount} content{totalCount !== 1 ? 's' : ''} found
          </Badge>
          
          {onCreateNew && (
            <Button onClick={onCreateNew} size="sm" className="h-8 text-xs">
              <Plus className="mr-1 h-3 w-3" />
              Create Content
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}