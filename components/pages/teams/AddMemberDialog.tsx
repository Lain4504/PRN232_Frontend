"use client"

import { useState, useEffect } from 'react'
import { useAddTeamMember } from '@/hooks/use-teams'
import { api, endpoints } from '@/lib/api'
import { User, TeamMemberCreateRequest } from '@/lib/types/aisam-types'
import { toast } from 'sonner'

// Role-based permissions mapping (synced with backend team_roles.json)
const ROLE_PERMISSIONS = {
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
const getPermissionsForRole = (role: string): string[] => {
    const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
    return permissions ? [...permissions] : []
}

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    teamId: string
}

export function AddMemberDialog({ open, onOpenChange, teamId }: Props) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUserId, setSelectedUserId] = useState('')
    const [role, setRole] = useState('Copywriter')
    const [permissions, setPermissions] = useState<string[]>([])
    const [showPermissions, setShowPermissions] = useState(false)

    const { mutateAsync: addMember, isPending: adding } = useAddTeamMember(teamId)

    // Auto-update permissions when role changes
    useEffect(() => {
        const rolePermissions = getPermissionsForRole(role)
        setPermissions(rolePermissions)
    }, [role])

    // Search users when query changes
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setUsers([])
            return
        }

        const searchUsers = async () => {
            setLoading(true)
            try {
                const url = `${endpoints.userSearch}?searchTerm=${encodeURIComponent(searchQuery)}&page=1&pageSize=10`

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response = await api.get<any>(url)

                // Backend returns PagedResult directly: { data: User[], totalCount, page, ... }
                if (response.data && Array.isArray(response.data.data)) {
                    const userData = response.data.data
                    setUsers(userData)
                } else {
                    setUsers([])
                }
            } catch (error) {
                toast.error('Không thể tìm kiếm users')
                setUsers([])
            } finally {
                setLoading(false)
            }
        }

        const debounceTimer = setTimeout(searchUsers, 300)
        return () => clearTimeout(debounceTimer)
    }, [searchQuery])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedUserId) {
            toast.error('Vui lòng chọn user')
            return
        }

        try {
            const requestData: TeamMemberCreateRequest = {
                TeamId: teamId,
                UserId: selectedUserId,
                Role: role,
                Permissions: permissions
            }

            await addMember(requestData)

            // Reset form
            resetForm()
            onOpenChange(false)

            toast.success('Thêm thành viên thành công!', {
                description: 'Thành viên đã được thêm vào team.',
                duration: 3000,
            })
        } catch (error) {
            toast.error('Không thể thêm thành viên', {
                description: error instanceof Error ? error.message : 'Vui lòng thử lại sau.',
                duration: 4000,
            })
        }
    }

    const resetForm = () => {
        setSearchQuery('')
        setUsers([])
        setSelectedUserId('')
        setRole('Copywriter')
        setPermissions(getPermissionsForRole('Copywriter'))
        setShowPermissions(false)
    }

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            resetForm()
        }
    }, [open])

    const togglePermission = (permission: string) => {
        if (permissions.includes(permission)) {
            setPermissions(permissions.filter(p => p !== permission))
        } else {
            setPermissions([...permissions, permission])
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Thêm thành viên mới</h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Search and Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Tìm và chọn User</label>
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Nhập tên hoặc email để tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            />

                            {loading && (
                                <div className="p-3 text-sm text-gray-500">Đang tìm kiếm...</div>
                            )}

                            {searchQuery.length >= 2 && !loading && users.length === 0 && (
                                <div className="p-3 text-sm text-gray-500">Không tìm thấy user nào</div>
                            )}

                            {users.length > 0 && (
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => {
                                        setSelectedUserId(e.target.value)
                                    }}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                >
                                    <option value="">-- Chọn user từ kết quả tìm kiếm --</option>
                                    {users.map((user) => {

                                        // Handle both camelCase and PascalCase
                                        const userId = user.id || `user-${Math.random()}`
                                        const userEmail = user.email || 'Unknown'

                                        return (
                                            <option key={userId} value={userId}>
                                                {userEmail}
                                            </option>
                                        )
                                    })}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Vai trò</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="Copywriter">Copywriter</option>
                            <option value="Designer">Designer</option>
                            <option value="SocialMediaManager">Social Media Manager</option>
                            <option value="TeamLeader">Team Leader</option>
                            <option value="Vendor">Vendor</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Quyền hạn sẽ tự động cập nhật theo vai trò được chọn
                        </p>
                    </div>

                    {/* Permissions Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Quyền hạn</label>
                            <button
                                type="button"
                                onClick={() => setShowPermissions(!showPermissions)}
                                className="text-sm text-blue-600 underline"
                            >
                                {showPermissions ? 'Ẩn' : 'Hiển thị'} quyền hạn
                            </button>
                        </div>

                        {permissions.length > 0 && (
                            <div className="text-sm text-gray-600 mb-2">
                                Đã chọn {permissions.length} quyền cho vai trò &quot;{role}&quot;
                            </div>
                        )}

                        {showPermissions && (
                            <div className="border rounded p-3 max-h-48 overflow-y-auto">
                                <div className="text-xs text-blue-600 mb-2 p-2 bg-blue-50 rounded">
                                    Quyền hạn này được tự động gán dựa trên vai trò &quot;{role}&quot;. Bạn có thể tùy chỉnh nếu cần.
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {getPermissionsForRole(role).map((permission) => (
                                        <label key={permission} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={permissions.includes(permission)}
                                                onChange={() => togglePermission(permission)}
                                            />
                                            <span className="truncate" title={permission}>
                                                {permission}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPermissions(getPermissionsForRole(role).slice())}
                                        className="text-sm text-blue-600 underline"
                                    >
                                        Chọn tất cả
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPermissions([])}
                                        className="text-sm text-red-600 underline"
                                    >
                                        Bỏ chọn tất cả
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={adding || !selectedUserId}
                            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                        >
                            {adding ? 'Đang thêm...' : 'Thêm thành viên'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}