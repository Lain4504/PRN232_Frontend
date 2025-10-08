'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  ChevronDown, 
  ChevronRight, 
  Facebook, 
  Twitter, 
  Smartphone, 
  Link, 
  Trash2, 
  MoreHorizontal,
  Building2,
  Users
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
import { SocialAccountDto, SocialTargetDto } from '@/lib/types/aisam-types'
import { ReAuthButton } from './ReAuthButton'
import { LinkIntegrationModal } from './LinkIntegrationModal'
import { useUnlinkAccount, useUnlinkTarget } from '@/hooks/use-social-accounts'
import { toast } from 'sonner'

interface SocialAccountListProps {
  accounts: SocialAccountDto[]
  userId: string
  onRefresh?: () => void
}

const providerIcons = {
  facebook: Facebook,
  tiktok: Smartphone,
  twitter: Twitter,
} as const

const providerColors = {
  facebook: 'bg-blue-500',
  tiktok: 'bg-black',
  twitter: 'bg-sky-500',
} as const

export function SocialAccountList({ accounts, userId, onRefresh }: SocialAccountListProps) {
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<{ accountId: string; targetId?: string } | null>(null)
  
  const unlinkAccountMutation = useUnlinkAccount()
  const unlinkTargetMutation = useUnlinkTarget()

  const toggleExpanded = (accountId: string) => {
    setExpandedAccounts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(accountId)) {
        newSet.delete(accountId)
      } else {
        newSet.add(accountId)
      }
      return newSet
    })
  }

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
    } catch (error) {
      console.error('Delete target error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlink integration'
      toast.error(errorMessage)
    } finally {
      setDeleteDialogOpen(null)
    }
  }

  if (accounts.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => {
        const isExpanded = expandedAccounts.has(account.id)
        const Icon = providerIcons[account.provider]
        const colorClass = providerColors[account.provider]
        const isExpired = account.expiresAt ? new Date(account.expiresAt) < new Date() : false

        return (
          <Card key={account.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(account.id)}
                    className="p-0 h-auto"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div>
                    <CardTitle className="text-lg capitalize">
                      {account.provider} Account
                    </CardTitle>
                    <CardDescription>
                      ID: {account.providerUserId}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={account.isActive ? 'default' : 'secondary'}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  
                  {isExpired && (
                    <Badge variant="destructive">Expired</Badge>
                  )}

                  <ReAuthButton
                    provider={account.provider}
                    accountId={account.id}
                    expiresAt={account.expiresAt}
                    className="h-8"
                  />

                  <LinkIntegrationModal
                    socialAccountId={account.id}
                    provider={account.provider}
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen({ accountId: account.id })}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Unlink Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Account Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-muted-foreground">
                        {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {account.expiresAt && (
                      <div>
                        <span className="font-medium">Expires:</span>
                        <p className="text-muted-foreground">
                          {new Date(account.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Linked Targets */}
                  {account.targets && account.targets.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-4 w-4" />
                          <h4 className="font-medium">Linked Pages</h4>
                          <Badge variant="outline">{account.targets.length}</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {account.targets.map((target) => (
                            <div
                              key={target.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={target.profilePictureUrl} alt={target.name} />
                                  <AvatarFallback>
                                    {target.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{target.name}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {target.type}
                                    </Badge>
                                    {target.brandName && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Building2 className="h-3 w-3" />
                                        {target.brandName}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setDeleteDialogOpen({ 
                                      accountId: account.id, 
                                      targetId: target.id 
                                    })}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Unlink Page
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {(!account.targets || account.targets.length === 0) && (
                    <>
                      <Separator />
                      <div className="text-center py-4">
                        <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-3">
                          No pages linked to this account
                        </p>
                        <LinkIntegrationModal
                          socialAccountId={account.id}
                          provider={account.provider}
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!deleteDialogOpen} 
        onOpenChange={() => setDeleteDialogOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialogOpen?.targetId ? 'Unlink Page' : 'Unlink Account'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogOpen?.targetId 
                ? 'Are you sure you want to unlink this page from its brand? This action cannot be undone.'
                : 'Are you sure you want to unlink this social account? All associated integrations will also be removed.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialogOpen?.targetId) {
                  handleDeleteTarget(deleteDialogOpen.targetId)
                } else if (deleteDialogOpen?.accountId) {
                  handleDeleteAccount(deleteDialogOpen.accountId)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDialogOpen?.targetId ? 'Unlink Page' : 'Unlink Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
