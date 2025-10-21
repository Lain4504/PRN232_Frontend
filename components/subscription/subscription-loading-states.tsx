'use client'

import { ReactNode, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle
} from 'lucide-react'

interface LoadingStateProps {
  message?: string
  progress?: number
  className?: string
}

export function SubscriptionLoadingState({ 
  message = 'Loading subscription data...', 
  progress,
  className = '' 
}: LoadingStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div>
            <p className="text-sm font-medium">{message}</p>
            {progress !== undefined && (
              <div className="mt-2">
                <Progress value={progress} className="w-48" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(progress)}% complete
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface RetryStateProps {
  error: string
  onRetry: () => void
  isRetrying?: boolean
  className?: string
}

export function SubscriptionRetryState({ 
  error, 
  onRetry, 
  isRetrying = false,
  className = '' 
}: RetryStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <XCircle className="h-8 w-8 mx-auto text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-600">Failed to load subscription data</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
          <Button 
            onClick={onRetry} 
            disabled={isRetrying}
            variant="outline"
            size="sm"
          >
            {isRetrying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface OperationStateProps {
  state: 'idle' | 'loading' | 'success' | 'error'
  message?: string
  error?: string
  onRetry?: () => void
  className?: string
}

export function SubscriptionOperationState({ 
  state, 
  message, 
  error, 
  onRetry,
  className = '' 
}: OperationStateProps) {
  const getStateIcon = () => {
    switch (state) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStateColor = () => {
    switch (state) {
      case 'loading':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getStateIcon()}
      <span className={`text-sm font-medium ${getStateColor()}`}>
        {message || state}
      </span>
      {state === 'error' && onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline" 
          size="sm"
          className="ml-2"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  )
}

interface PlanChangeProgressProps {
  step: 'validating' | 'processing' | 'confirming' | 'complete' | 'error'
  message?: string
  error?: string
  onRetry?: () => void
  className?: string
}

export function PlanChangeProgress({ 
  step, 
  message, 
  error, 
  onRetry,
  className = '' 
}: PlanChangeProgressProps) {
  const steps = [
    { key: 'validating', label: 'Validating Plan Change' },
    { key: 'processing', label: 'Processing Payment' },
    { key: 'confirming', label: 'Confirming Changes' },
    { key: 'complete', label: 'Plan Updated' }
  ]

  const currentStepIndex = steps.findIndex(s => s.key === step)
  const progress = step === 'error' ? 0 : ((currentStepIndex + 1) / steps.length) * 100

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {step === 'error' ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : step === 'complete' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          )}
          <span>Plan Change</span>
        </CardTitle>
        <CardDescription>
          {message || 'Updating your subscription plan...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        
        <div className="space-y-2">
          {steps.map((stepItem, index) => (
            <div 
              key={stepItem.key}
              className={`flex items-center space-x-2 text-sm ${
                index < currentStepIndex ? 'text-green-600' :
                index === currentStepIndex ? 'text-blue-600' :
                'text-muted-foreground'
              }`}
            >
              {index < currentStepIndex ? (
                <CheckCircle className="h-4 w-4" />
              ) : index === currentStepIndex ? (
                step === 'error' ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span>{stepItem.label}</span>
            </div>
          ))}
        </div>

        {step === 'error' && error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'error' && onRetry && (
          <Button onClick={onRetry} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Higher-order component for loading states
export function withSubscriptionLoading<T extends object>(
  Component: React.ComponentType<T>,
  loadingMessage?: string
) {
  return function SubscriptionLoadingWrapper(props: T & { isLoading?: boolean }) {
    if (props.isLoading) {
      return <SubscriptionLoadingState message={loadingMessage} />
    }
    
    return <Component {...props} />
  }
}

// Hook for managing loading states
export function useSubscriptionLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  
  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }))
  }
  
  const isLoading = (key: string) => loadingStates[key] || false
  
  const withLoading = async <T,>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    setLoading(key, true)
    try {
      return await operation()
    } finally {
      setLoading(key, false)
    }
  }
  
  return {
    setLoading,
    isLoading,
    withLoading
  }
}
