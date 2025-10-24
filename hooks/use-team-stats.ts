import { useQuery } from '@tanstack/react-query'
import { api, endpoints, PaginatedResponse } from '@/lib/api'
import type { BrandResponseDto, ContentResponseDto, Post, TeamMemberResponseDto } from '@/lib/types/aisam-types'

// Query Keys
export const teamStatsKeys = {
  all: ['team-stats'] as const,
  byTeam: (teamId: string) => [...teamStatsKeys.all, 'team', teamId] as const,
}

// Get comprehensive team statistics
export function useTeamStatistics(teamId?: string) {
  return useQuery({
    queryKey: teamId ? teamStatsKeys.byTeam(teamId) : teamStatsKeys.all,
    queryFn: async (): Promise<{
      // Team info
      teamMembersCount: number
      brandsCount: number
      
      // Content stats
      totalContents: number
      draftContents: number
      pendingApprovals: number
      publishedContents: number
      
      // Post stats
      totalPosts: number
      scheduledPosts: number
      publishedPosts: number
      
      // Performance stats
      averageCTR: number
      totalEngagement: number
      
      // Recent activity
      recentContents: ContentResponseDto[]
      recentPosts: Post[]
    }> => {
      if (!teamId) {
        return {
          teamMembersCount: 0,
          brandsCount: 0,
          totalContents: 0,
          draftContents: 0,
          pendingApprovals: 0,
          publishedContents: 0,
          totalPosts: 0,
          scheduledPosts: 0,
          publishedPosts: 0,
          averageCTR: 0,
          totalEngagement: 0,
          recentContents: [],
          recentPosts: []
        }
      }

      try {
        // Get team members count
        const membersResp = await api.get<TeamMemberResponseDto[]>(endpoints.teamMembers(teamId))
        const teamMembersCount = membersResp.data.length

        // Get team brands
        const brandsResp = await api.get<BrandResponseDto[]>(`/brands/team/${teamId}`)
        const brands = brandsResp.data
        const brandsCount = brands.length

        if (brands.length === 0) {
          return {
            teamMembersCount,
            brandsCount: 0,
            totalContents: 0,
            draftContents: 0,
            pendingApprovals: 0,
            publishedContents: 0,
            totalPosts: 0,
            scheduledPosts: 0,
            publishedPosts: 0,
            averageCTR: 0,
            totalEngagement: 0,
            recentContents: [],
            recentPosts: []
          }
        }

        // Get contents for team brands
        const brandIds = brands.map(brand => brand.id)
        const brandIdParams = brandIds.map(id => `brandId=${id}`).join('&')
        const contentsResp = await api.get<PaginatedResponse<ContentResponseDto>>(`${endpoints.contents()}?${brandIdParams}&pageSize=100`)
        const contents = contentsResp.data.data

        // Get posts for team brands
        const postsResp = await api.get<PaginatedResponse<Post>>(`${endpoints.posts.list()}?${brandIdParams}&pageSize=100`)
        const posts = postsResp.data.data

        // Calculate content statistics
        const totalContents = contents.length
        const draftContents = contents.filter(c => c.status === 'Draft').length
        const publishedContents = contents.filter(c => c.status === 'Published').length
        const pendingApprovals = contents.filter(c => c.status === 'PendingApproval').length

        // Calculate post statistics
        const totalPosts = posts.length
        const scheduledPosts = posts.filter(p => p.status === 'Scheduled').length
        const publishedPosts = posts.filter(p => p.status === 'Published').length

        // Calculate performance statistics (mock data for now)
        const averageCTR = 0 // TODO: Calculate from actual metrics
        const totalEngagement = 0 // TODO: Calculate from actual metrics

        // Get recent activity
        const recentContents = contents
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)

        const recentPosts = posts
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)

        return {
          teamMembersCount,
          brandsCount,
          totalContents,
          draftContents,
          pendingApprovals,
          publishedContents,
          totalPosts,
          scheduledPosts,
          publishedPosts,
          averageCTR,
          totalEngagement,
          recentContents,
          recentPosts
        }
      } catch (error) {
        console.error('Error fetching team statistics:', error)
        return {
          teamMembersCount: 0,
          brandsCount: 0,
          totalContents: 0,
          draftContents: 0,
          pendingApprovals: 0,
          publishedContents: 0,
          totalPosts: 0,
          scheduledPosts: 0,
          publishedPosts: 0,
          averageCTR: 0,
          totalEngagement: 0,
          recentContents: [],
          recentPosts: []
        }
      }
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
