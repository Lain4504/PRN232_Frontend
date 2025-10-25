'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { 
  Building2, 
  Plus, 
  Trash2, 
  MoreHorizontal,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { useBrandsByTeam } from '@/hooks/use-brands'
import { useUnassignBrand } from '@/hooks/use-teams'
import { toast } from 'sonner'
import { Brand } from '@/lib/types/aisam-types'

interface TeamBrandsListProps {
  teamId: string
  canManage?: boolean
  onAddBrand?: () => void
}

export function TeamBrandsList({ teamId, canManage = true, onAddBrand }: TeamBrandsListProps) {
  const [unassigningBrand, setUnassigningBrand] = useState<Brand | null>(null)
  
  const { data: brands = [], isLoading } = useBrandsByTeam(teamId)
  const { mutateAsync: unassignBrand, isPending: unassigning } = useUnassignBrand(teamId)

  const handleUnassign = async (brand: Brand) => {
    try {
      await unassignBrand({ brandId: brand.id })
      toast.success('Brand removed successfully!', {
        description: `${brand.name} has been removed from the team.`,
        duration: 3000,
      })
      setUnassigningBrand(null)
    } catch (error) {
      toast.error('Could not remove brand', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Brands</CardTitle>
          <CardDescription>Loading brands...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (brands.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Team Brands</CardTitle>
            <CardDescription>
              Manage brands associated with this team
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No brands yet</h3>
            <p className="text-muted-foreground mb-4">
              Add brands to this team to start managing them together.
            </p>
            {canManage && (
              <Button onClick={onAddBrand}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Brand
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Define table columns
  const columns: ColumnDef<Brand>[] = [
    {
      accessorKey: 'name',
      header: 'Brand Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{row.getValue('name')}</div>
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
      accessorKey: 'slogan',
      header: 'Slogan',
      cell: ({ row }) => {
        const slogan = row.getValue('slogan') as string
        return slogan ? (
          <Badge variant="secondary">{slogan}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge variant={status === 'Active' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string
        return (
          <span className="text-sm text-muted-foreground">
            {date ? new Date(date).toLocaleDateString() : '-'}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
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
            onClick: () => setUnassigningBrand(row.original),
            variant: "destructive" as const,
          });
        }

        return <ActionsDropdown actions={actions} />;
      },
    },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Brands</CardTitle>
              <CardDescription>
                {brands.length} brand{brands.length !== 1 ? 's' : ''} associated with this team
              </CardDescription>
            </div>
            {canManage && (
              <Button onClick={onAddBrand} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={brands}
            loading={isLoading}
            emptyMessage="No brands found"
            emptyDescription="No brands are associated with this team yet."
            searchPlaceholder="Search brands by name or description..."
            filterColumn="name"
          />
        </CardContent>
      </Card>

      {/* Unassign Confirmation Dialog */}
      <AlertDialog open={!!unassigningBrand} onOpenChange={() => setUnassigningBrand(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove Brand from Team
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
              onClick={() => unassigningBrand && handleUnassign(unassigningBrand)}
              disabled={unassigning}
              className="bg-destructive hover:bg-destructive/90"
            >
              {unassigning ? 'Removing...' : 'Remove Brand'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
