import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  Sparkles,
  TrendingUp,
  ArrowRight
} from 'lucide-react'

// Mock data for demo
const mockTeam = {
  name: 'Marketing Team',
  description: 'Content creation and campaign management',
  membersCount: 12,
  role: 'editor'
}

const mockStats = {
  teamMembersCount: 12,
  brandsCount: 4,
  totalContents: 38,
  pendingApprovals: 5,
  recentContents: [
    { id: 1, title: 'Summer Campaign Strategy', status: 'Draft', createdAt: new Date().toISOString() },
    { id: 2, title: 'Product Launch Guide', status: 'In Review', createdAt: new Date().toISOString() },
    { id: 3, title: 'Social Media Calendar', status: 'Approved', createdAt: new Date().toISOString() }
  ],
  recentPosts: []
}

const mockBrands = [
  { id: 1, name: 'TechCorp', description: 'Technology Solutions', status: 'Active' },
  { id: 2, name: 'DesignHub', description: 'Creative Agency', status: 'Active' },
  { id: 3, name: 'MarketPlace', description: 'E-commerce Platform', status: 'Active' }
]

export function TeamDashboardOverview() {
  const activeTeam = mockTeam
  const stats = mockStats
  const teamBrands = mockBrands
  const isLoading = false

  const statsCards = [
    {
      title: "Members",
      value: stats.teamMembersCount,
      icon: Users,
      trend: "+2 this month"
    },
    {
      title: "Brands",
      value: stats.brandsCount,
      icon: Building2,
      trend: "All active"
    },
    {
      title: "Content",
      value: stats.totalContents,
      icon: FileText,
      trend: "+12 this week"
    },
    {
      title: "Pending",
      value: stats.pendingApprovals,
      icon: CheckCircle,
      trend: "Needs review"
    }
  ]

  const quickActions = [
    {
      title: "Create Content",
      icon: Sparkles,
      variant: "default" as const
    },
    {
      title: "View Library",
      icon: FileText,
      variant: "outline" as const
    },
    {
      title: "Approvals",
      icon: CheckCircle,
      variant: "outline" as const
    },
    {
      title: "Schedule",
      icon: Calendar,
      variant: "outline" as const
    }
  ]

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {/* Compact Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {activeTeam.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTeam.description}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize text-xs px-2 py-1">
                {activeTeam.role}
              </Badge>
            </div>
          </div>

          {/* Compact Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statsCards.map((stat) => (
                <Card key={stat.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-3">
                    <div className="flex items-center justify-between mb-1">
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                      <TrendingUp className="h-3 w-3 text-success" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                      <p className="text-xs text-muted-foreground/70">{stat.trend}</p>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>

          {/* Compact Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                  <CardDescription className="text-xs">Common team tasks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {quickActions.map((action) => (
                    <Button
                        key={action.title}
                        variant={action.variant}
                        className="h-auto py-3 flex flex-col gap-1.5"
                    >
                      <action.icon className="h-4 w-4" />
                      <span className="text-xs font-medium">{action.title}</span>
                    </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Compact Team Brands */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Active Brands</CardTitle>
                    <CardDescription className="text-xs">{teamBrands.length} brands</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs px-2 py-1">
                    View all
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  {teamBrands.map((brand) => (
                      <div
                          key={brand.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{brand.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {brand.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          {brand.status}
                        </Badge>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compact Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Recent Content</CardTitle>
                    <CardDescription className="text-xs">{stats.recentContents.length} items</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs px-2 py-1">
                    View all
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  {stats.recentContents.map((content) => (
                      <div
                          key={content.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{content.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(content.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          {content.status}
                        </Badge>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
