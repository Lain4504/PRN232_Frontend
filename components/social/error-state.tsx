'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryText?: string
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message = 'There was an error loading your data. Please try again.',
  onRetry,
  retryText = 'Try again'
}: ErrorStateProps) {
  return (
    <Card className="border border-destructive/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-lg font-semibold text-destructive">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            {retryText}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

