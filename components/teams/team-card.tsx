"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Building2 } from 'lucide-react'

interface TeamCardProps {
  team: {
    id: string
    name: string
    description?: string
    role: string
    membersCount: number
    status: string
  }
  onClick?: () => void
}

export function TeamCard({ team, onClick }: TeamCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{team.name}</CardTitle>
              <CardDescription>
                {team.description || 'No description'}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary">
              {team.role}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {team.membersCount} members
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
