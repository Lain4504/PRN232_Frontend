'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Trash2,
  MoreHorizontal,
  Eye,
  RefreshCw,
  AlertTriangle,
  Link
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { SocialAccountDto, SocialAuthUrlResponse } from '@/lib/types/aisam-types'
import { LinkIntegrationModal } from './link-integration-modal'
import { IntegrationsModal } from './integrations-modal'
import { useUnlinkAccount, useUnlinkTarget } from '@/hooks/use-social-accounts'
import { toast } from 'sonner'
import {SiFacebook, SiInstagram, SiTiktok} from "@icons-pack/react-simple-icons";
import { api, endpoints } from '@/lib/api'

interface SocialAccountListProps {
  accounts: SocialAccountDto[]
  userId: string
  onRefresh?: () => void
}

const providerIcons = {
  facebook: SiFacebook,
  tiktok: SiTiktok,
  instagram: SiInstagram,
} as const

const providerColors = {
  facebook: 'bg-blue-500',
  tiktok: 'bg-black',
  instagram: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
} as const

export function SocialAccountList({ accounts, userId, onRefresh }: SocialAccountListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<{ accountId: string; targetId?: string } | null>(null)
  const [integrationsModalOpen, setIntegrationsModalOpen] = useState<{ accountId: string; account: SocialAccountDto } | null>(null)
  const [linkModalOpen, setLinkModalOpen] = useState<{ accountId: string; provider: string } | null>(null)
  const [isReAuthing, setIsReAuthing] = useState<string | null>(null)
  
  const unlinkAccountMutation = useUnlinkAccount()
  const unlinkTargetMutation = useUnlinkTarget()

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await unlinkAccountMutation.mutateAsync({ userId, socialAccountId: accountId })
      toast.success('Account unlinked successfully')
      onRefresh?.()
    } catch (error) {
      console.error('Delete account error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlink account'
      toast.error(errorMessage)
    } finally {
      setDeleteDialogOpen(null)
    }
  }

  const handleDeleteTarget = async (targetId: string) => {
    try {
      await unlinkTargetMutation.mutateAsync({ userId, socialIntegrationId: targetId })
      toast.success('Integration unlinked successfully')
      onRefresh?.()
      // Close integrations modal after successful unlink
      setIntegrationsModalOpen(null)
    } catch (error) {
      console.error('Delete target error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlink integration'
      toast.error(errorMessage)
    } finally {
      setDeleteDialogOpen(null)
    }
  }

  const handleReAuth = async (provider: 'facebook' | 'tiktok' | 'instagram', accountId: string) => {
    try {
      setIsReAuthing(accountId)
      const response = await api.get<SocialAuthUrlResponse>(endpoints.socialAuth(provider))
      
      if (response.data?.authUrl) {
        // Redirect to OAuth URL
        window.location.href = response.data.authUrl
      } else {
        toast.error('Failed to get authentication URL')
      }
    } catch (error) {
      console.error('Re-auth error:', error)
      toast.error('Failed to start re-authentication')
    } finally {
      setIsReAuthing(null)
    }
  }

  const renderReAuthButton = (account: SocialAccountDto) => {
    const isExpired = account.expiresAt ? new Date(account.expiresAt) < new Date() : false
    const isExpiringSoon = account.expiresAt ? {
      expires: new Date(account.expiresAt),
      now: new Date(),
      diff: new Date(account.expiresAt).getTime() - new Date().getTime(),
      daysLeft: Math.ceil((new Date(account.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    } : null

    const isLoading = isReAuthing === account.id

    if (isExpired) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-xs font-medium">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReAuth(account.provider, account.id)}
            disabled={isLoading}
            className="h-8 text-xs border-destructive/20 hover:bg-destructive/5"
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3 w-3" />
            )}
            Re-authenticate
          </Button>
        </div>
      )
    }

    if (isExpiringSoon && isExpiringSoon.daysLeft <= 7) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
            Expires in {isExpiringSoon.daysLeft} day{isExpiringSoon.daysLeft !== 1 ? 's' : ''}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReAuth(account.provider, account.id)}
            disabled={isLoading}
            className="h-8 text-xs border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/10"
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3 w-3" />
            )}
            Refresh Token
          </Button>
        </div>
      )
    }

    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleReAuth(account.provider, account.id)}
        disabled={isLoading}
        className="h-8 text-xs hover:bg-muted/50"
      >
        {isLoading ? (
          <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-3 w-3" />
        )}
        Re-authenticate
      </Button>
    )
  }


  if (accounts.length === 0) {
    return null
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Table View - Responsive for all screen sizes */}
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
              {accounts.map((account) => {
                const Icon = providerIcons[account.provider]
                const colorClass = providerColors[account.provider]
                const isExpired = account.expiresAt ? new Date(account.expiresAt) < new Date() : false

                return (
                  <TableRow key={account.id} className="hover:bg-muted/50">
                    <TableCell className="py-3 px-2 lg:px-3">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div className={`p-1.5 lg:p-2 rounded-lg ${colorClass} shadow-sm flex-shrink-0`}>
                          <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold capitalize text-sm lg:text-base truncate">
                            {account.provider} Account
                          </div>
                          <div className="text-xs lg:text-sm text-muted-foreground font-mono truncate">
                            ID: {account.providerUserId}
                          </div>
                          {/* Mobile: Show status inline */}
                          <div className="sm:hidden flex items-center gap-1 mt-1">
                            <Badge 
                              variant={account.isActive ? 'default' : 'secondary'} 
                              className="text-xs font-medium"
                            >
                              {account.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {isExpired && (
                              <Badge variant="destructive" className="text-xs font-medium">
                                Expired
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Desktop Status Column */}
                    <TableCell className="hidden sm:table-cell py-3 px-2 lg:px-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={account.isActive ? 'default' : 'secondary'} 
                          className="text-xs font-medium"
                        >
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {isExpired && (
                          <Badge variant="destructive" className="text-xs font-medium">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Desktop Created Column */}
                    <TableCell className="hidden md:table-cell py-3 px-2 lg:px-3 font-mono text-sm">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </TableCell>
                    
                    {/* Desktop Expires Column */}
                    <TableCell className="hidden lg:table-cell py-3 px-2 lg:px-3 font-mono text-sm">
                      {account.expiresAt ? new Date(account.expiresAt).toLocaleDateString() : 'Never'}
                    </TableCell>
                    
                    <TableCell className="py-3 px-2 lg:px-3">
                      <Badge variant="outline" className="text-xs">
                        {account.targets?.length || 0} Linked
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="py-3 px-2 lg:px-3 text-right">
                      <div className="flex items-center justify-end gap-1 lg:gap-2">
                        {/* Mobile: Only show essential actions */}
                        <div className="lg:hidden">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(account.targets?.length || 0) > 0 && (
                                <DropdownMenuItem 
                                  onClick={() => setIntegrationsModalOpen({ accountId: account.id, account })}
                                  className="cursor-pointer"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Integrations
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleReAuth(account.provider, account.id)}
                                disabled={isReAuthing === account.id}
                                className="cursor-pointer"
                              >
                                {isReAuthing === account.id ? (
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                Re-authenticate
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setLinkModalOpen({ accountId: account.id, provider: account.provider })}
                                className="cursor-pointer"
                              >
                                <Link className="mr-2 h-4 w-4" />
                                Link to Brand
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteDialogOpen({ accountId: account.id })}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Unlink Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Desktop: Show all actions */}
                        <div className="hidden lg:flex items-center gap-2">
                          {(account.targets?.length || 0) > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIntegrationsModalOpen({ accountId: account.id, account })}
                              className="h-8 text-xs"
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View Integrations
                            </Button>
                          )}

                          {renderReAuthButton(account)}

                          <LinkIntegrationModal
                            socialAccountId={account.id}
                            provider={account.provider}
                          />

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setDeleteDialogOpen({ accountId: account.id })}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Unlink Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Link Integration Modal */}
        {linkModalOpen && (
          <LinkIntegrationModal
            socialAccountId={linkModalOpen.accountId}
            provider={linkModalOpen.provider}
            open={!!linkModalOpen}
            onOpenChange={(open) => !open && setLinkModalOpen(null)}
          />
        )}

        {/* Integrations Modal */}
        {integrationsModalOpen && (
          <IntegrationsModal
            account={integrationsModalOpen.account}
            isOpen={!!integrationsModalOpen}
            onClose={() => setIntegrationsModalOpen(null)}
            onDeleteTarget={(targetId, accountId) => setDeleteDialogOpen({ accountId, targetId })}
          />
        )}

        {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!deleteDialogOpen} 
        onOpenChange={() => setDeleteDialogOpen(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              {deleteDialogOpen?.targetId ? 'Unlink Page' : 'Unlink Account'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {deleteDialogOpen?.targetId 
                ? 'Are you sure you want to unlink this page from its brand? This action cannot be undone.'
                : 'Are you sure you want to unlink this social account? All associated integrations will also be removed.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialogOpen?.targetId) {
                  handleDeleteTarget(deleteDialogOpen.targetId)
                } else if (deleteDialogOpen?.accountId) {
                  handleDeleteAccount(deleteDialogOpen.accountId)
                }
              }}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDialogOpen?.targetId ? 'Unlink Page' : 'Unlink Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
