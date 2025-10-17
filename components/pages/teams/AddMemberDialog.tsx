"use client"

import { useState, useEffect } from 'react'
import { useAddTeamMember } from '@/hooks/use-teams'
import { api, endpoints } from '@/lib/api'
import { User, TeamMemberCreateRequest } from '@/lib/types/aisam-types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { Search } from 'lucide-react'
import { getPermissionsForRole, getPermissionInfo } from '@/lib/constants/team-roles'

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
            } catch {
                toast.error('Could not search users')
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
            toast.error('Please select a user')
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

            toast.success('Successfully added member!', {
                description: 'The member has been added to the team.',
                duration: 3000,
            })
        } catch (error) {
            toast.error('Could not add member', {
                description: error instanceof Error ? error.message : 'Please try again later.',
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

    const isMobile = useIsMobile()

    const content = (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Search and select User</Label>
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Enter name or email to search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-8"
                    />
                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                {loading && <div className="text-sm text-muted-foreground">Searching...</div>}
                {searchQuery.length >= 2 && !loading && users.length === 0 && (
                    <div className="text-sm text-muted-foreground">No users found</div>
                )}

                {users.length > 0 && (
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select user from results" /></SelectTrigger>
                        <SelectContent>
                            {users.map((user) => {
                                const userId = user.id || `user-${Math.random()}`
                                const userEmail = user.email || 'Unknown'
                                return (
                                    <SelectItem key={userId} value={userId}>{userEmail}</SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Copywriter">Copywriter</SelectItem>
                        <SelectItem value="Designer">Designer</SelectItem>
                        <SelectItem value="Marketer">Marketer</SelectItem>
                        <SelectItem value="TeamLeader">Team Leader</SelectItem>
                        <SelectItem value="Vendor">Vendor</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Permissions will be automatically updated based on the selected role</p>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Permissions</Label>
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setShowPermissions(!showPermissions)}>
                        {showPermissions ? 'Hide' : 'Show'} permissions
                    </Button>
                </div>

                {permissions.length > 0 && (
                    <div className="text-sm text-muted-foreground mb-2">
                        Selected {permissions.length} permissions for role &quot;{role}&quot;
                    </div>
                )}

                {showPermissions && (
                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-muted/20">
                        <div className="text-xs mb-2 p-2 rounded bg-background/50 border">These permissions are automatically assigned based on the role. You can customize them.</div>
                        <TooltipProvider>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {getPermissionsForRole(role).map((permission) => {
                                    const info = getPermissionInfo(permission)
                                    return (
                                        <Tooltip key={permission}>
                                            <TooltipTrigger asChild>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <Checkbox
                                                        checked={permissions.includes(permission)}
                                                        onCheckedChange={() => togglePermission(permission)}
                                                    />
                                                    <span className="truncate">
                                                        {info?.label || permission}
                                                    </span>
                                                </label>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{info?.description || permission}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )
                                })}
                            </div>
                        </TooltipProvider>
                        <div className="mt-3 flex gap-2">
                            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setPermissions(getPermissionsForRole(role).slice())}>Select all</Button>
                            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setPermissions([])}>Deselect all</Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={adding || !selectedUserId} size="sm" className="w-full md:w-auto h-8 text-xs">{adding ? 'Adding...' : 'Add member'}</Button>
            </div>
        </form>
    )

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[90vh] flex flex-col">
                    <DrawerHeader className="flex-shrink-0 text-left">
                        <DrawerTitle>Add new member</DrawerTitle>
                        <DrawerDescription>Search for a user, select a role, and set permissions.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 overflow-y-auto flex-1 pt-2">
                        {content}
                    </div>
                    <DrawerFooter className="flex-shrink-0 pt-2">
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Add new member</DialogTitle>
                    <DialogDescription>Search for a user, select a role, and set permissions.</DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1">
                    {content}
                </div>
            </DialogContent>
        </Dialog>
    )
}