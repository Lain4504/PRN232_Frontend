'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, Link, ArrowRight } from 'lucide-react'

interface EmptyStateProps {
  onConnect?: () => void
  type?: 'accounts' | 'integrations'
}

export function EmptyState({ onConnect, type = 'accounts' }: EmptyStateProps) {
  const isAccounts = type === 'accounts'
  
  return (
    <Card className="w-full max-w-lg mx-auto border-0 shadow-lg bg-gradient-to-br from-muted/30 to-muted/10">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
          {isAccounts ? (
            <Users className="h-10 w-10 text-primary" />
          ) : (
            <Link className="h-10 w-10 text-primary" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold mb-2">
          {isAccounts ? 'No Social Accounts Connected' : 'No Integrations Found'}
        </CardTitle>
        <CardDescription className="text-base leading-relaxed max-w-md mx-auto">
          {isAccounts 
            ? 'Connect your social media accounts to start managing your content and campaigns with AISAM.'
            : 'Link your social accounts to brands to create integrations for seamless content posting.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pb-8">
        {isAccounts && onConnect && (
          <div className="space-y-4">
            <Button onClick={onConnect} className="w-full h-12 text-base font-medium">
              <Plus className="mr-2 h-5 w-5" />
              Connect Your First Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Secure OAuth connection • No passwords stored
            </p>
          </div>
        )}
        {!isAccounts && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              First connect a social account, then you can link it to your brands to create integrations.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Connect Account</span>
              <ArrowRight className="h-3 w-3" />
              <Link className="h-3 w-3" />
              <span>Link to Brand</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
