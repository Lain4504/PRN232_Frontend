"use client";

import React, { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  ColumnDef,
} from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface CustomTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  showIndex?: boolean;
  indexLabel?: string;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  className?: string;
  headerClassName?: string;
  emptyMessage?: string;
  loadingRows?: number;
  onRowClick?: (row: TData) => void;
}

export function CustomTable<TData, TValue>({
  columns: originalColumns,
  data,
  isLoading = false,
  showIndex = true,
  indexLabel = "STT",
  currentPage = 0,
  pageSize = 10,
  totalItems,
  className,
  headerClassName = "bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-300/60",
  emptyMessage = "No data found",
  loadingRows = 5,
  onRowClick,
}: CustomTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Create columns with optional index column
  const columns = useMemo(() => {
    const indexColumn: ColumnDef<TData, TValue> = {
      id: "index",
      header: indexLabel,
      cell: ({ row }) => {
        // Calculate the correct item number based on current page and page size
        // If we have totalItems and filtering, use the actual row index
        // Otherwise, calculate based on pagination
        const baseIndex = currentPage * pageSize;
        const displayIndex = baseIndex + row.index + 1;
        return (
          <div className="text-center font-medium text-gray-700">
            {displayIndex}
          </div>
        );
      },
      enableSorting: false,
      size: 60,
      maxSize: 60,
    } as ColumnDef<TData, TValue>;

    return showIndex ? [indexColumn, ...originalColumns] : originalColumns;
  }, [originalColumns, showIndex, indexLabel, currentPage, pageSize]);

  // Initialize the react-table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true, // We handle pagination externally
  });

  // Generate skeleton rows for loading state
  const renderSkeletonRows = () => {
    return Array.from({ length: loadingRows }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {columns.map((column, colIndex) => (
          <TableCell 
            key={`skeleton-cell-${colIndex}`}
            className={cn(
              "py-3 px-4",
              column.id === "index" && "text-center",
              column.id === "actions" && "w-16 px-4 text-center"
            )}
          >
            {column.id === "index" ? (
              <div className="h-4 w-6 bg-gray-100/60 animate-pulse rounded mx-auto" />
            ) : column.id === "actions" ? (
              <div className="h-8 w-8 bg-gray-100/60 animate-pulse rounded mx-auto" />
            ) : colIndex === 1 && showIndex ? (
              // First data column - usually has avatar + text
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100/60 animate-pulse" />
                <div className="h-4 w-32 bg-gray-100/60 animate-pulse rounded" />
              </div>
            ) : (
              <div className="h-4 w-24 bg-gray-100/60 animate-pulse rounded" />
            )}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("rounded-lg border border-gray-200/60 overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm", className)}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={headerClassName}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className={cn(
                      "text-gray-500 font-medium text-xs uppercase tracking-wide py-3 px-4 h-12 text-center",
                      header.id === "index" && "w-16",
                      header.id === "actions" && "w-16"
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {renderSkeletonRows()}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-gray-200/60 overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className={headerClassName}>
              {headerGroup.headers.map((header) => (
                <TableHead 
                  key={header.id} 
                  className={cn(
                    "text-gray-500 font-medium text-xs uppercase tracking-wide py-3 px-4 h-12 text-center",
                    header.id === "index" && "w-16",
                    header.id === "actions" && "w-16"
                  )}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={header.column.getCanSort() ? "flex items-center justify-center gap-1 cursor-pointer select-none" : ""}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center py-12">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {emptyMessage}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row, index) => (
              <TableRow 
                key={row.id}
                className={cn(
                  "hover:bg-gray-50/40 transition-all duration-200 border-b border-gray-200/60 last:border-b-0",
                  index % 2 === 0 ? "bg-white/60" : "bg-gray-50/20",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell 
                    key={cell.id} 
                    className={cn(
                      "py-3 px-4 text-gray-700 text-sm font-medium",
                      cell.column.id === "index" && "w-16 text-center font-semibold text-gray-800",
                      cell.column.id === "actions" && "w-16 px-4 text-center"
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}