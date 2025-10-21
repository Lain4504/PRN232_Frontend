'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Users, Link, ArrowRight } from 'lucide-react'
import { ConnectModal } from '@/components/social/connect-modal'

interface EmptyStateProps {
  onConnect?: () => void
  type?: 'accounts' | 'integrations'
}

export function EmptyState({ onConnect, type = 'accounts' }: EmptyStateProps) {
  const isAccounts = type === 'accounts'
  
  return (
    <Card className="border border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
          {isAccounts ? (
            <Users className="h-6 w-6 text-primary" />
          ) : (
            <Link className="h-6 w-6 text-primary" />
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {isAccounts ? 'No Social Accounts Connected' : 'No Integrations Found'}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-sm mx-auto">
          {isAccounts 
            ? 'Connect your social media accounts to start managing your content and campaigns with AISAM.'
            : 'Link your social accounts to brands to create integrations for seamless content posting.'
          }
        </p>
        {isAccounts && (
          <div className="space-y-3">
            <ConnectModal>
              <Button size="sm" className="h-8 text-xs">
                <Plus className="mr-1 h-3 w-3" />
                Connect Your First Account
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </ConnectModal>
            <p className="text-xs text-muted-foreground">
              Secure OAuth connection • No passwords stored
            </p>
          </div>
        )}
        {!isAccounts && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              First connect a social account, then you can link it to your brands to create integrations.
            </p>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
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
