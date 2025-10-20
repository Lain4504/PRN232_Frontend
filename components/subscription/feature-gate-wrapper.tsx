'use client'

import { ReactNode } from 'react'
import { useFeatureGate } from '@/hooks/use-feature-gate'
import { FeatureGate } from './feature-gate'
import { UpgradePrompt } from './upgrade-prompt'

interface FeatureGateWrapperProps {
  featureId: string
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
  upgradePromptVariant?: 'card' | 'alert' | 'inline'
  upgradePromptTitle?: string
  upgradePromptDescription?: string
  className?: string
}

export function FeatureGateWrapper({
  featureId,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradePromptVariant = 'card',
  upgradePromptTitle,
  upgradePromptDescription,
  className = ''
}: FeatureGateWrapperProps) {
  const { canAccess, featureGate, isLoading } = useFeatureGate(featureId)

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (canAccess) {
    return <div className={className}>{children}</div>
  }

  if (fallback) {
    return <div className={className}>{fallback}</div>
  }

  if (!showUpgradePrompt) {
    return null
  }

  return (
    <div className={className}>
      {upgradePromptVariant === 'card' ? (
        <FeatureGate
          featureId={featureId}
          showUpgradePrompt={true}
        >
          {children}
        </FeatureGate>
      ) : (
        <UpgradePrompt
          featureId={featureId}
          title={upgradePromptTitle}
          description={upgradePromptDescription}
          variant={upgradePromptVariant}
        />
      )}
    </div>
  )
}

// Higher-order component for feature gating
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  featureId: string,
  options?: {
    fallback?: ReactNode
    showUpgradePrompt?: boolean
    upgradePromptVariant?: 'card' | 'alert' | 'inline'
    upgradePromptTitle?: string
    upgradePromptDescription?: string
  }
) {
  return function FeatureGatedComponent(props: P) {
    return (
      <FeatureGateWrapper
        featureId={featureId}
        fallback={options?.fallback}
        showUpgradePrompt={options?.showUpgradePrompt}
        upgradePromptVariant={options?.upgradePromptVariant}
        upgradePromptTitle={options?.upgradePromptTitle}
        upgradePromptDescription={options?.upgradePromptDescription}
      >
        <Component {...props} />
      </FeatureGateWrapper>
    )
  }
}

// Conditional rendering hook
export function useFeatureGateRender(featureId: string) {
  const { canAccess, isLoading } = useFeatureGate(featureId)

  return {
    canAccess,
    isLoading,
    render: (children: ReactNode, fallback?: ReactNode) => {
      if (isLoading) {
        return <div className="animate-pulse">Loading...</div>
      }
      
      if (canAccess) {
        return children
      }
      
      return fallback || null
    }
  }
}

// Action-based feature gating
export function useFeatureAction(featureId: string) {
  const { canAccess, featureGate, isLoading } = useFeatureGate(featureId)

  const executeAction = (action: () => void) => {
    if (canAccess) {
      action()
    } else {
      // Could trigger upgrade prompt or show notification
      console.log('Feature not available:', featureGate?.upgradePrompt)
    }
  }

  return {
    canAccess,
    isLoading,
    executeAction,
    upgradePrompt: featureGate?.upgradePrompt
  }
}
