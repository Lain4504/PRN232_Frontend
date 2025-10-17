// Permission definitions with labels and descriptions
export const PERMISSIONS = {
    'CREATE_TEAM': {
        label: 'Create Team',
        description: 'User with this permission can create new teams within the organization'
    },
    'UPDATE_TEAM': {
        label: 'Update Team',
        description: 'User with this permission can modify team information such as name and description'
    },
    'DELETE_TEAM': {
        label: 'Delete Team',
        description: 'User with this permission can permanently remove teams from the organization'
    },
    'VIEW_TEAM_DETAILS': {
        label: 'View Team Details',
        description: 'User with this permission can view detailed information about teams'
    },
    'VIEW_TEAM_MEMBERS': {
        label: 'View Team Members',
        description: 'User with this permission can view the list of team members'
    },
    'VIEW_TEAM_MEMBER_DETAILS': {
        label: 'View Team Member Details',
        description: 'User with this permission can view detailed information about individual team members'
    },
    'ADD_MEMBER': {
        label: 'Add Member',
        description: 'User with this permission can add new members to the team'
    },
    'REMOVE_MEMBER': {
        label: 'Remove Member',
        description: 'User with this permission can remove members from the team'
    },
    'UPDATE_MEMBER_ROLE': {
        label: 'Update Member Role',
        description: 'User with this permission can change the role of team members'
    },
    'UPDATE_MEMBER_PERMISSIONS': {
        label: 'Update Member Permissions',
        description: 'User with this permission can modify individual permissions of team members'
    },
    'ASSIGN_TASK': {
        label: 'Assign Task',
        description: 'User with this permission can assign tasks and responsibilities to team members'
    },
    'INVITE_MEMBER': {
        label: 'Invite Member',
        description: 'User with this permission can send invitations to potential new team members'
    },
    'APPROVE_JOIN_REQUEST': {
        label: 'Approve Join Request',
        description: 'User with this permission can approve requests from users wanting to join the team'
    },
    'CREATE_CONTENT': {
        label: 'Create Content',
        description: 'User with this permission can create new content for social media posts'
    },
    'EDIT_CONTENT': {
        label: 'Edit Content',
        description: 'User with this permission can modify existing content before publication'
    },
    'SUBMIT_FOR_APPROVAL': {
        label: 'Submit for Approval',
        description: 'User with this permission can submit content for review and approval'
    },
    'VIEW_APPROVALS': {
        label: 'View Approvals',
        description: 'User with this permission can view the list of content awaiting approval'
    },
    'APPROVE_CONTENT': {
        label: 'Approve Content',
        description: 'User with this permission can approve content for publication'
    },
    'REJECT_CONTENT': {
        label: 'Reject Content',
        description: 'User with this permission can reject content that does not meet standards'
    },
    'SCHEDULE_POST': {
        label: 'Schedule Post',
        description: 'User with this permission can schedule posts for future publication'
    },
    'PUBLISH_POST': {
        label: 'Publish Post',
        description: 'User with this permission can immediately publish approved content'
    },
    'VIEW_POSTS': {
        label: 'View Posts',
        description: 'User with this permission can view published and scheduled posts'
    },
    'DELETE_POST': {
        label: 'Delete Post',
        description: 'User with this permission can remove published or scheduled posts'
    },
    'VIEW_REPORTS': {
        label: 'View Reports',
        description: 'User with this permission can view performance and analytics reports'
    },
    'PULL_REPORTS': {
        label: 'Pull Reports',
        description: 'User with this permission can retrieve fresh data from social media platforms'
    },
    'LINK_SOCIAL_ACCOUNT': {
        label: 'Link Social Account',
        description: 'User with this permission can connect personal social media accounts'
    },
    'UNLINK_SOCIAL_ACCOUNT': {
        label: 'Unlink Social Account',
        description: 'User with this permission can disconnect social media accounts'
    },
    'LINK_SOCIAL_INTEGRATION': {
        label: 'Link Social Integration',
        description: 'User with this permission can connect brand pages and business accounts'
    },
    'UNLINK_SOCIAL_INTEGRATION': {
        label: 'Unlink Social Integration',
        description: 'User with this permission can disconnect brand pages and business accounts'
    },
    'VIEW_TEAM_ANALYTICS': {
        label: 'View Team Analytics',
        description: 'User with this permission can view team-wide performance metrics and insights'
    },
    'SUBMIT_AI_GENERATION': {
        label: 'Submit AI Generation',
        description: 'User with this permission can submit prompts for AI content generation'
    },
    'VIEW_AI_GENERATIONS': {
        label: 'View AI Generations',
        description: 'User with this permission can view AI-generated content and suggestions'
    },
    'VIEW_NOTIFICATIONS': {
        label: 'View Notifications',
        description: 'User with this permission can view system notifications and alerts'
    },
    'VIEW_SUBSCRIPTIONS': {
        label: 'View Subscriptions',
        description: 'User with this permission can view subscription details and usage quotas'
    }
} as const

// Role-based permissions mapping (synced with backend team_roles.json)
export const ROLE_PERMISSIONS = {
    'Vendor': [
        'CREATE_TEAM',
        'UPDATE_TEAM',
        'DELETE_TEAM',
        'VIEW_TEAM_DETAILS',
        'VIEW_TEAM_MEMBERS',
        'VIEW_TEAM_MEMBER_DETAILS',
        'ADD_MEMBER',
        'REMOVE_MEMBER',
        'UPDATE_MEMBER_ROLE',
        'UPDATE_MEMBER_PERMISSIONS',
        'ASSIGN_TASK',
        'INVITE_MEMBER',
        'APPROVE_JOIN_REQUEST',
        'CREATE_CONTENT',
        'EDIT_CONTENT',
        'SUBMIT_FOR_APPROVAL',
        'VIEW_APPROVALS',
        'APPROVE_CONTENT',
        'REJECT_CONTENT',
        'SCHEDULE_POST',
        'PUBLISH_POST',
        'VIEW_POSTS',
        'DELETE_POST',
        'VIEW_REPORTS',
        'PULL_REPORTS',
        'LINK_SOCIAL_ACCOUNT',
        'UNLINK_SOCIAL_ACCOUNT',
        'LINK_SOCIAL_INTEGRATION',
        'UNLINK_SOCIAL_INTEGRATION',
        'VIEW_TEAM_ANALYTICS',
        'SUBMIT_AI_GENERATION',
        'VIEW_AI_GENERATIONS',
        'VIEW_NOTIFICATIONS',
        'VIEW_SUBSCRIPTIONS'
    ],
    'TeamLeader': [
        'VIEW_TEAM_DETAILS',
        'VIEW_TEAM_MEMBERS',
        'VIEW_TEAM_MEMBER_DETAILS',
        'ADD_MEMBER',
        'REMOVE_MEMBER',
        'UPDATE_MEMBER_ROLE',
        'UPDATE_MEMBER_PERMISSIONS',
        'ASSIGN_TASK',
        'INVITE_MEMBER',
        'APPROVE_JOIN_REQUEST',
        'CREATE_CONTENT',
        'EDIT_CONTENT',
        'SUBMIT_FOR_APPROVAL',
        'VIEW_APPROVALS',
        'APPROVE_CONTENT',
        'REJECT_CONTENT',
        'SCHEDULE_POST',
        'PUBLISH_POST',
        'VIEW_POSTS',
        'DELETE_POST',
        'VIEW_REPORTS',
        'PULL_REPORTS',
        'LINK_SOCIAL_INTEGRATION',
        'UNLINK_SOCIAL_INTEGRATION',
        'VIEW_TEAM_ANALYTICS',
        'SUBMIT_AI_GENERATION',
        'VIEW_AI_GENERATIONS',
        'VIEW_NOTIFICATIONS',
        'VIEW_SUBSCRIPTIONS'
    ],
    'SocialMediaManager': [
        'VIEW_TEAM_DETAILS',
        'VIEW_TEAM_MEMBERS',
        'ASSIGN_TASK',
        'CREATE_CONTENT',
        'EDIT_CONTENT',
        'SUBMIT_FOR_APPROVAL',
        'VIEW_APPROVALS',
        'APPROVE_CONTENT',
        'REJECT_CONTENT',
        'SCHEDULE_POST',
        'PUBLISH_POST',
        'VIEW_POSTS',
        'DELETE_POST',
        'VIEW_REPORTS',
        'PULL_REPORTS',
        'LINK_SOCIAL_INTEGRATION',
        'UNLINK_SOCIAL_INTEGRATION',
        'VIEW_TEAM_ANALYTICS',
        'SUBMIT_AI_GENERATION',
        'VIEW_AI_GENERATIONS',
        'VIEW_NOTIFICATIONS',
        'VIEW_SUBSCRIPTIONS'
    ],
    'Designer': [
        'VIEW_TEAM_DETAILS',
        'VIEW_TEAM_MEMBERS',
        'CREATE_CONTENT',
        'EDIT_CONTENT',
        'SUBMIT_FOR_APPROVAL',
        'VIEW_APPROVALS',
        'VIEW_POSTS',
        'VIEW_REPORTS',
        'SUBMIT_AI_GENERATION',
        'VIEW_AI_GENERATIONS',
        'VIEW_NOTIFICATIONS',
        'VIEW_SUBSCRIPTIONS'
    ],
    'Copywriter': [
        'VIEW_TEAM_DETAILS',
        'VIEW_TEAM_MEMBERS',
        'CREATE_CONTENT',
        'EDIT_CONTENT',
        'SUBMIT_FOR_APPROVAL',
        'VIEW_APPROVALS',
        'VIEW_POSTS',
        'VIEW_REPORTS',
        'SUBMIT_AI_GENERATION',
        'VIEW_AI_GENERATIONS',
        'VIEW_NOTIFICATIONS',
        'VIEW_SUBSCRIPTIONS'
    ]
} as const

// Get available permissions for a specific role
export const getPermissionsForRole = (role: string): string[] => {
    const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
    return permissions ? [...permissions] : []
}

// Get permission label and description
export const getPermissionInfo = (permission: string): { label: string; description: string } | null => {
    const info = PERMISSIONS[permission as keyof typeof PERMISSIONS]
    return info ? { ...info } : null
}

// Get all permissions with their info
export const getAllPermissions = () => {
    return Object.entries(PERMISSIONS).map(([key, value]) => ({
        id: key,
        ...value
    }))
}