"use client"

import React from 'react'
import { useTeam } from '@/lib/contexts/team-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Lock } from 'lucide-react'

interface TeamPermissionGateProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showMessage?: boolean
}

export function TeamPermissionGate({ 
  permission, 
  children, 
  fallback,
  showMessage = true 
}: TeamPermissionGateProps) {
  const { hasPermission, activeTeam } = useTeam()

  if (!hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showMessage) {
      return (
        <Alert className="border-amber-200 bg-amber-50">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You don&apos;t have permission to access this feature. 
            {activeTeam && (
              <span className="block text-sm mt-1">
                Your role: <strong>{activeTeam.role}</strong>
              </span>
            )}
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return <>{children}</>
}

interface TeamPermissionGateMultipleProps {
  permissions: string[]
  requireAll?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  showMessage?: boolean
}

export function TeamPermissionGateMultiple({ 
  permissions, 
  requireAll = false,
  children, 
  fallback,
  showMessage = true 
}: TeamPermissionGateMultipleProps) {
  const { hasPermission, activeTeam } = useTeam()

  const hasRequiredPermissions = requireAll 
    ? permissions.every(permission => hasPermission(permission))
    : permissions.some(permission => hasPermission(permission))

  if (!hasRequiredPermissions) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showMessage) {
      return (
        <Alert className="border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You don&apos;t have the required permissions to access this feature.
            {activeTeam && (
              <span className="block text-sm mt-1">
                Your role: <strong>{activeTeam.role}</strong>
              </span>
            )}
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return <>{children}</>
}
