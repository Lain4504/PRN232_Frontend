"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  canGoToNextPage,
  canGoToPreviousPage,
  goToFirstPage,
  goToLastPage,
  goToNextPage,
  goToPreviousPage,
  className,
}: TablePaginationProps) {
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 ${className}`}>
      {/* Items info */}
      <div className="text-xs text-gray-500 font-medium">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>

      <div className="flex items-center gap-4">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-20 h-8 rounded-md border-gray-200/60 bg-white/60 backdrop-blur-sm text-gray-600 focus:border-gray-300 focus:ring-1 focus:ring-gray-200/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirstPage}
            disabled={!canGoToPreviousPage}
            className="h-8 w-8 p-0 rounded-md border-gray-200/60 hover:bg-gray-50/60 disabled:opacity-40 disabled:cursor-not-allowed bg-white/60 backdrop-blur-sm"
          >
            <ChevronsLeft className="h-3.5 w-3.5 text-gray-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={!canGoToPreviousPage}
            className="h-8 w-8 p-0 rounded-md border-gray-200/60 hover:bg-gray-50/60 disabled:opacity-40 disabled:cursor-not-allowed bg-white/60 backdrop-blur-sm"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-gray-500" />
          </Button>
          
          <div className="flex items-center gap-1 px-3">
            <span className="text-xs text-gray-500 font-medium">
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={!canGoToNextPage}
            className="h-8 w-8 p-0 rounded-md border-gray-200/60 hover:bg-gray-50/60 disabled:opacity-40 disabled:cursor-not-allowed bg-white/60 backdrop-blur-sm"
          >
            <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToLastPage}
            disabled={!canGoToNextPage}
            className="h-8 w-8 p-0 rounded-md border-gray-200/60 hover:bg-gray-50/60 disabled:opacity-40 disabled:cursor-not-allowed bg-white/60 backdrop-blur-sm"
          >
            <ChevronsRight className="h-3.5 w-3.5 text-gray-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}