"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Activity,
  BarChart3,
  Calendar,
  Plus,
  Filter,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

// Stats Cards Data
const statsData = [
  {
    title: "Total Organizations",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: Building2,
    color: "text-blue-600",
  },
  {
    title: "Active Users", 
    value: "18,249",
    change: "+8.2%",
    trend: "up",
    icon: Users,
    color: "text-green-600",
  },
  {
    title: "Revenue",
    value: "$45,231",
    change: "-2.4%", 
    trend: "down",
    icon: TrendingUp,
    color: "text-purple-600",
  },
  {
    title: "Activity Score",
    value: "94.8%",
    change: "+1.2%",
    trend: "up", 
    icon: Activity,
    color: "text-orange-600",
  },
]

// Recent Activities Data
const recentActivities = [
  {
    id: 1,
    user: {
      name: "John Doe",
      avatar: "/avatars/john.jpg",
      email: "john@example.com"
    },
    action: "Created new organization",
    target: "Tech Innovations Ltd",
    time: "2 minutes ago",
    type: "create"
  },
  {
    id: 2,
    user: {
      name: "Sarah Smith",
      avatar: "/avatars/sarah.jpg", 
      email: "sarah@example.com"
    },
    action: "Updated user permissions",
    target: "Marketing Team",
    time: "1 hour ago",
    type: "update"
  },
  {
    id: 3,
    user: {
      name: "Mike Johnson",
      avatar: "/avatars/mike.jpg",
      email: "mike@example.com"
    },
    action: "Generated monthly report",
    target: "Q4 Analytics",
    time: "3 hours ago", 
    type: "report"
  },
  {
    id: 4,
    user: {
      name: "Lisa Chen",
      avatar: "/avatars/lisa.jpg",
      email: "lisa@example.com"
    },
    action: "Deleted inactive accounts",
    target: "15 accounts",
    time: "1 day ago",
    type: "delete"
  },
]

const DashboardContent = () => {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "create":
        return <Plus className="h-4 w-4 text-green-600" />
      case "update":
        return <Activity className="h-4 w-4 text-blue-600" />
      case "report":
        return <BarChart3 className="h-4 w-4 text-purple-600" />
      case "delete":
        return <Activity className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your organization today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Organization
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === 'up' ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3 text-red-600" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions in your organization
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback>
                      {activity.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      <span className="text-foreground">{activity.user.name}</span>
                      <span className="text-muted-foreground"> {activity.action}</span>
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.target}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cache</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Warning
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  95% Available
                </Badge>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Additional Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Overview</CardTitle>
          <CardDescription>
            Key metrics for today ({new Date().toLocaleDateString()})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">New Signups</p>
              <p className="text-2xl font-bold">23</p>
              <p className="text-xs text-green-600">+15% from yesterday</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-blue-600">Current online users</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Support Tickets</p>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-orange-600">3 pending response</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">System Uptime</p>
              <p className="text-2xl font-bold">99.9%</p>
              <p className="text-xs text-green-600">Last 30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardContent