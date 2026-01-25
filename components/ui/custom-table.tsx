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
import { Loader2, PackageOpen } from "lucide-react";

interface CustomTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  showIndex?: boolean;
  indexLabel?: string;
  currentPage?: number;
  pageSize?: number;
  className?: string;
  headerClassName?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  loadingRows?: number;
  onRowClick?: (row: TData) => void;
}

export function CustomTable<TData, TValue>({
  columns: originalColumns,
  data,
  isLoading = false,
  showIndex = true,
  indexLabel = "#",
  currentPage = 0,
  pageSize = 10,
  className,
  headerClassName,
  emptyMessage = "No Data",
  emptyDescription = "No records found in the database.",
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
        const baseIndex = currentPage * pageSize;
        const displayIndex = baseIndex + row.index + 1;
        return (
          <div className="text-center font-medium text-muted-foreground/70">
            {displayIndex}
          </div>
        );
      },
      enableSorting: false,
      size: 50,
      maxSize: 50,
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
      <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
        {columns.map((column, colIndex) => (
          <TableCell
            key={`skeleton-cell-${colIndex}`}
            className="py-4 px-4"
          >
            <div className="h-4 w-full bg-primary/5 animate-pulse rounded" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className={cn(
      "rounded-2xl border border-white/10 overflow-hidden bg-background/40 backdrop-blur-xl shadow-2xl custom-scrollbar",
      className
    )}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className={cn(
                "hover:bg-transparent border-b border-white/10 bg-white/5",
                headerClassName
              )}
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "h-12 text-muted-foreground font-semibold text-xs uppercase tracking-wider py-3 px-4",
                    header.id === "index" && "w-[50px] text-center",
                    header.id === "actions" && "w-[50px] text-center"
                  )}
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={cn(
                        "flex items-center gap-2 select-none",
                        header.column.getCanSort() && "cursor-pointer hover:text-primary transition-colors",
                        header.id === "actions" && "justify-center",
                        header.id === "index" && "justify-center"
                      )}
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
          {isLoading ? (
            renderSkeletonRows()
          ) : data.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="size-16 rounded-full bg-muted/10 flex items-center justify-center mb-4">
                    <PackageOpen className="size-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                    {emptyMessage}
                  </h3>
                  <p className="text-sm text-muted-foreground/60 max-w-sm">
                    {emptyDescription}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  "border-b border-white/5 transition-all duration-200 group",
                  "hover:bg-primary/5 hover:border-primary/10",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "py-4 px-4 text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors",
                      cell.column.id === "index" && "text-center text-muted-foreground",
                      cell.column.id === "actions" && "text-center"
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
