'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface LoadingStateProps {
  count?: number
}

export function LoadingState({ count = 3 }: LoadingStateProps) {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="overflow-x-auto border rounded-lg">
        <Table className="min-w-[600px] w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px] lg:w-[300px] py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Account</TableHead>
              <TableHead className="hidden sm:table-cell py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</TableHead>
              <TableHead className="hidden md:table-cell py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</TableHead>
              <TableHead className="hidden lg:table-cell py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Expires</TableHead>
              <TableHead className="py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Integrations</TableHead>
              <TableHead className="text-right py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: count }).map((_, i) => (
              <TableRow key={i} className="hover:bg-muted/50">
                <TableCell className="py-3 px-2 lg:px-3">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
                    <Skeleton className="h-6 w-6 lg:h-8 lg:w-8 rounded-lg flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 lg:h-5 w-24 lg:w-32 mb-1" />
                      <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
                      {/* Mobile status skeleton */}
                      <div className="sm:hidden flex items-center gap-1 mt-1">
                        <Skeleton className="h-4 w-12 rounded-full" />
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                {/* Desktop Status Column */}
                <TableCell className="hidden sm:table-cell py-3 px-2 lg:px-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                </TableCell>
                
                {/* Desktop Created Column */}
                <TableCell className="hidden md:table-cell py-3 px-2 lg:px-3">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                
                {/* Desktop Expires Column */}
                <TableCell className="hidden lg:table-cell py-3 px-2 lg:px-3">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                
                <TableCell className="py-3 px-2 lg:px-3">
                  <Skeleton className="h-4 w-16 rounded-full" />
                </TableCell>
                
                <TableCell className="py-3 px-2 lg:px-3 text-right">
                  <div className="flex items-center justify-end gap-1 lg:gap-2">
                    {/* Mobile: Single dropdown button */}
                    <div className="lg:hidden">
                      <Skeleton className="h-7 w-7 rounded" />
                    </div>
                    
                    {/* Desktop: Multiple buttons */}
                    <div className="hidden lg:flex items-center gap-2">
                      <Skeleton className="h-8 w-20 rounded-md" />
                      <Skeleton className="h-8 w-20 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

