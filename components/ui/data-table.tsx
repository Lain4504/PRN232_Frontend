"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  showPagination?: boolean;
  showSearch?: boolean;
  showPageSize?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  searchPlaceholder = "Search...",
  pageSize = 10,
  className,
  loading = false,
  emptyMessage = "No data available",
  emptyDescription = "There are no items to display at the moment.",
  showPagination = true,
  showSearch = true,
  showPageSize = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalItems = table.getFilteredRowModel().rows.length;

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <div className="h-9 w-full bg-gray-100/60 animate-pulse rounded-lg pl-10" />
          </div>
          <div className="h-9 w-32 bg-gray-100/60 animate-pulse rounded-lg" />
        </div>
        <div className="border border-gray-200/60 rounded-lg overflow-hidden bg-white/80 backdrop-blur-sm">
          <div className="h-12 bg-gray-50/50 animate-pulse" />
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="h-14 border-t border-gray-100/50 bg-white/60 animate-pulse" />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-gray-100/60 animate-pulse rounded" />
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-8 bg-gray-100/60 animate-pulse rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      {(showSearch || showPageSize) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {showSearch && (
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className="pl-10 h-9 rounded-lg border-gray-200/60 bg-white/60 backdrop-blur-sm placeholder:text-gray-400 text-gray-600 focus:border-gray-300 focus:ring-1 focus:ring-gray-200/50"
              />
            </div>
          )}
          {showPageSize && (
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-32 h-9 rounded-lg border-gray-200/60 bg-white/60 backdrop-blur-sm text-gray-600 focus:border-gray-300 focus:ring-1 focus:ring-gray-200/50">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200/60 overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="min-w-[640px] sm:min-w-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-300/60">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-500 font-medium text-xs uppercase tracking-wide py-3 px-4 h-12 text-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "hover:bg-gray-50/40 transition-all duration-200 border-b border-gray-200/60 last:border-b-0",
                    index % 2 === 0 ? "bg-white/60" : "bg-gray-50/20"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className={cn(
                        "py-3 text-gray-700 text-sm font-medium",
                        cell.column.id === "actions" 
                          ? "w-16 px-4 text-center" 
                          : "px-4"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center py-12"
                >
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {emptyMessage}
                    </p>
                    <p className="text-xs text-gray-400">
                      {emptyDescription}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-gray-500 font-medium">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            totalItems
          )}{" "}
          of {totalItems} entries
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0 rounded-md border-gray-200/60 hover:bg-gray-50/60 disabled:opacity-40 disabled:cursor-not-allowed bg-white/60 backdrop-blur-sm"
          >
            <ChevronsLeft className="h-3.5 w-3.5 text-gray-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0 rounded-md border-gray-200/60 hover:bg-gray-50/60 disabled:opacity-40 disabled:cursor-not-allowed bg-white/60 backdrop-blur-sm"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-gray-500" />
          </Button>
          <div className="flex items-center gap-1 px-3">
            <span className="text-xs text-gray-500 font-medium">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0 rounded-md border-gray-200/60 hover:bg-gray-50/60 disabled:opacity-40 disabled:cursor-not-allowed bg-white/60 backdrop-blur-sm"
          >
            <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0 rounded-md border-gray-200/60 hover:bg-gray-50/60 disabled:opacity-40 disabled:cursor-not-allowed bg-white/60 backdrop-blur-sm"
          >
            <ChevronsRight className="h-3.5 w-3.5 text-gray-500" />
          </Button>
        </div>
      </div>
      )}
    </div>
  );
}