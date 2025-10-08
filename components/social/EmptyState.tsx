'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, Link } from 'lucide-react'

interface EmptyStateProps {
  onConnect?: () => void
  type?: 'accounts' | 'integrations'
}

export function EmptyState({ onConnect, type = 'accounts' }: EmptyStateProps) {
  const isAccounts = type === 'accounts'
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          {isAccounts ? (
            <Users className="h-8 w-8 text-muted-foreground" />
          ) : (
            <Link className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <CardTitle className="text-xl">
          {isAccounts ? 'No Social Accounts Connected' : 'No Integrations Found'}
        </CardTitle>
        <CardDescription>
          {isAccounts 
            ? 'Connect your social media accounts to start managing your content and campaigns.'
            : 'Link your social accounts to brands to create integrations for posting content.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {isAccounts && onConnect && (
          <Button onClick={onConnect} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
        )}
        {!isAccounts && (
          <p className="text-sm text-muted-foreground">
            First connect a social account, then you can link it to your brands.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
