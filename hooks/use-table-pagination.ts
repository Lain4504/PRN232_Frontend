"use client";

import { useState, useMemo } from "react";

interface UseTablePaginationProps {
  data: any[];
  pageSize?: number;
  searchTerm?: string;
  filters?: Record<string, any>;
}

interface UseTablePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  paginatedData: any[];
  filteredData: any[];
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
  getItemNumber: (index: number) => number;
}

export function useTablePagination({
  data,
  pageSize: initialPageSize = 10,
  searchTerm = "",
  filters = {},
}: UseTablePaginationProps): UseTablePaginationReturn {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((item) => {
        return Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        filtered = filtered.filter((item) => {
          if (typeof value === "string") {
            return String(item[key]).toLowerCase().includes(value.toLowerCase());
          }
          return item[key] === value;
        });
      }
    });

    return filtered;
  }, [data, searchTerm, filters]);

  // Calculate pagination values
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Navigation functions
  const goToFirstPage = () => setCurrentPage(0);
  const goToLastPage = () => setCurrentPage(Math.max(0, totalPages - 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  // Navigation state
  const canGoToNextPage = currentPage < totalPages - 1;
  const canGoToPreviousPage = currentPage > 0;

  // Get item number for display (1-based indexing)
  const getItemNumber = (index: number) => {
    return currentPage * pageSize + index + 1;
  };

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(0);
  }, [searchTerm, filters]);

  // Handle page size change
  const handleSetPageSize = (newPageSize: number) => {
    const currentItemIndex = currentPage * pageSize;
    const newPage = Math.floor(currentItemIndex / newPageSize);
    setPageSize(newPageSize);
    setCurrentPage(newPage);
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData,
    filteredData,
    setCurrentPage,
    setPageSize: handleSetPageSize,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    canGoToNextPage,
    canGoToPreviousPage,
    getItemNumber,
  };
}