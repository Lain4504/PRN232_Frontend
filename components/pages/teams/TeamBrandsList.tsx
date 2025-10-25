'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { 
  Plus, 
  Trash2, 
  AlertTriangle,
  ExternalLink,
  Search,
  Target
} from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBrandsByTeam } from '@/hooks/use-brands'
import { useUnassignBrand } from '@/hooks/use-teams'
import { toast } from 'sonner'
import { Brand } from '@/lib/types/aisam-types'

interface TeamBrandsListProps {
  teamId: string
  canManage?: boolean
  onAddBrand?: () => void
}

// Create columns for the data table
const createColumns = (
  handleUnassignBrand: (brand: Brand) => void,
  canManage: boolean,
  isUnassigning: boolean
): ColumnDef<Brand>[] => [
  {
    accessorKey: "name",
    header: "Brand Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {row.original.logo_url ? (
            <AvatarImage src={row.original.logo_url} alt={row.getValue("name")} />
          ) : (
            <AvatarFallback>
              <Target className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-semibold text-gray-800">{row.getValue("name")}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {row.original.description}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="text-muted-foreground line-clamp-2 max-w-xs text-center">
        {row.getValue("description") || 'No description'}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="text-center">
          <Badge variant={status === 'Active' ? 'default' : 'secondary'}>
            {status || 'Active'}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <span className="text-sm text-muted-foreground text-center block">
          {date ? new Date(date).toLocaleDateString() : '-'}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    size: 50,
    maxSize: 50,
    cell: ({ row }) => {
      const actions: ActionItem[] = [
        {
          label: "View Brand",
          icon: <ExternalLink className="h-4 w-4" />,
          onClick: () => window.open(`/dashboard/brands/${row.original.id}`, '_blank'),
        },
      ];

      if (canManage) {
        actions.push({
          label: "Remove from team",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => handleUnassignBrand(row.original),
          variant: "destructive" as const,
          disabled: isUnassigning,
        });
      }

      return (
        <div className="flex justify-center">
          <ActionsDropdown actions={actions} disabled={isUnassigning} />
        </div>
      );
    },
  },
];

export function TeamBrandsList({ teamId, canManage = true, onAddBrand }: TeamBrandsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [unassigningBrand, setUnassigningBrand] = useState<Brand | null>(null);
  
  const { data: brands = [], isLoading } = useBrandsByTeam(teamId);
  const { mutateAsync: unassignBrand, isPending: unassigning } = useUnassignBrand(teamId);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnassignBrand = (brand: Brand) => {
    setUnassigningBrand(brand);
  };

  const confirmUnassignBrand = async () => {
    if (!unassigningBrand) return;

    try {
      await unassignBrand({ brandId: unassigningBrand.id });
      toast.success(`Brand "${unassigningBrand.name}" has been removed from the team successfully`);
      setUnassigningBrand(null);
    } catch (error) {
      console.error('Failed to remove brand:', error);
      toast.error('Failed to remove brand from team');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="h-10 w-64 mb-3 bg-muted animate-pulse rounded" />
              <div className="h-5 w-80 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-8 w-28 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  const totalBrands = brands.length;

  return (
    <>
      {/* Single Row Layout - Stats, Rows, Search, Add Button */}
      <div className="flex items-center gap-4">
        {/* Stats */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm shadow-sm">
          <Target className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="font-semibold text-gray-700">{totalBrands}</span>
          <span className="text-gray-500">Brands</span>
        </div>

        {/* Page Size Selector */}
        <Select
          value={String(pageSize)}
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Rows" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        {/* Add Button */}
        {canManage && (
          <div className="ml-auto">
            <Button onClick={onAddBrand} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </div>
        )}
      </div>

      {/* Brands Table */}
      {filteredBrands.length > 0 ? (
        <DataTable
          columns={createColumns(
            handleUnassignBrand,
            canManage,
            unassigning
          )}
          data={filteredBrands}
          pageSize={pageSize}
          showSearch={false}
          showPageSize={false}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No brands found' : 'No brands yet'}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-sm mx-auto">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Add brands to this team to start managing them together'
                }
              </p>
              {!searchTerm && canManage && (
                <Button onClick={onAddBrand}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Brand
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unassign Confirmation Dialog */}
      <AlertDialog open={!!unassigningBrand} onOpenChange={() => setUnassigningBrand(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove Brand from Team?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{unassigningBrand?.name}</strong> from this team? 
              This action will unlink the brand from the team, but the brand itself will remain intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unassigning}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnassignBrand}
              disabled={unassigning}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {unassigning ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Brand
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
