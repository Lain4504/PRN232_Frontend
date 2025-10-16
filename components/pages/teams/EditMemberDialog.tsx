"use client"

import { useState, useEffect } from 'react'
import { useUpdateTeamMember } from '@/hooks/use-teams'
import { TeamMemberResponseDto } from '@/lib/types/aisam-types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useIsMobile } from '@/hooks/use-mobile'
import { getPermissionsForRole } from '@/lib/constants/team-roles'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    teamId: string
    member: TeamMemberResponseDto | null
}

export function EditMemberDialog({ open, onOpenChange, teamId, member }: Props) {
    const [role, setRole] = useState(member?.role || 'Copywriter')
    const [permissions, setPermissions] = useState<string[]>(member?.permissions || [])
    const [showPermissions, setShowPermissions] = useState(false)

    const { mutateAsync: updateMember, isPending: updating } = useUpdateTeamMember(teamId, member?.id || '')

    // Auto-update permissions when role changes
    useEffect(() => {
        const rolePermissions = getPermissionsForRole(role)
        setPermissions(rolePermissions)
    }, [role])

    // Reset form when member changes
    useEffect(() => {
        if (member) {
            setRole(member.role || 'Copywriter')
            setPermissions(member.permissions || [])
            setShowPermissions(false)
        }
    }, [member])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!member) return

        try {
            await updateMember({
                role: role,
                isActive: member.isActive,
                permissions: permissions
            })

            toast.success('Update successful!', {
                description: 'Member information has been updated.',
                duration: 3000,
            })
            onOpenChange(false)
        } catch {
            toast.error('Update failed', {
                description: 'Could not update member information.',
                duration: 4000,
            })
        }
    }

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
                <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Vendor">Vendor</SelectItem>
                        <SelectItem value="TeamLeader">Team Leader</SelectItem>
                        <SelectItem value="Designer">Designer</SelectItem>
                        <SelectItem value="Copywriter">Copywriter</SelectItem>
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
                        Selected {permissions.length} permissions for role {role}
                    </div>
                )}

                {showPermissions && (
                    <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-muted/20">
                        <div className="text-xs mb-2 p-2 rounded bg-background/50 border">These permissions are automatically assigned based on the role. You can customize them.</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {getPermissionsForRole(role).map((permission) => (
                                <label key={permission} className="flex items-center gap-2">
                                    <Checkbox
                                        checked={permissions.includes(permission)}
                                        onCheckedChange={() => togglePermission(permission)}
                                    />
                                    <span className="truncate" title={permission}>{permission}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setPermissions(getPermissionsForRole(role).slice())}>Select all</Button>
                            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setPermissions([])}>Deselect all</Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={updating} size="sm" className="w-full md:w-auto h-8 text-xs">{updating ? 'Updating...' : 'Update'}</Button>
            </div>
        </form>
    )

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[90vh] flex flex-col">
                    <DrawerHeader className="flex-shrink-0 text-left">
                        <DrawerTitle>Edit Member</DrawerTitle>
                        <DrawerDescription>Change the role and permissions of the member.</DrawerDescription>
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
                    <DialogTitle>Edit Member</DialogTitle>
                    <DialogDescription>Change the role and permissions of the member.</DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1">
                    {content}
                </div>
            </DialogContent>
        </Dialog>
    )
}