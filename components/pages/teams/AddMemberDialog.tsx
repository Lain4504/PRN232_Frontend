"use client"

import { useState, useEffect } from 'react'
import { useAddTeamMember } from '@/hooks/use-teams'
import { api, endpoints, PaginatedResponse } from '@/lib/api'
import { User, TeamMemberCreateRequest } from '@/lib/types/omniadly-types'
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
import { useDebounceValue } from '@/hooks/use-debounce-value'
import { Search, UserPlus, Shield, ChevronRight, X, UserSearch, Target, LayoutDashboard, Key, Loader2 } from 'lucide-react'
import { getPermissionsForRole, getPermissionInfo } from '@/lib/constants/team-roles'
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

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

    useEffect(() => {
        const rolePermissions = getPermissionsForRole(role)
        setPermissions(rolePermissions)
    }, [role])

    const [debouncedSearchQuery] = useDebounceValue(searchQuery, 500)

    // Search users when debounced query changes
    useEffect(() => {
        if (!debouncedSearchQuery.trim() || debouncedSearchQuery.length < 2) {
            setUsers([])
            return
        }

        const searchUsers = async () => {
            setLoading(true)
            try {
                const url = `${endpoints.userSearch}?searchTerm=${encodeURIComponent(debouncedSearchQuery)}&page=1&pageSize=10`
                const response = await api.get<PaginatedResponse<User>>(url)
                if (response.data && Array.isArray(response.data.data)) {
                    setUsers(response.data.data)
                } else {
                    setUsers([])
                }
            } catch {
                setUsers([])
            } finally {
                setLoading(false)
            }
        }

        searchUsers()
    }, [debouncedSearchQuery])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUserId) {
            toast.error('Vui lòng chọn nhân sự cụ thể')
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
            resetForm()
            onOpenChange(false)
            toast.success('Đã thêm thành viên mới!')
        } catch (error) {
            toast.error('Lỗi khi thêm thành viên')
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

    useEffect(() => {
        if (!open) resetForm()
    }, [open])

    const togglePermission = (permission: string) => {
        if (permissions.includes(permission)) {
            setPermissions(permissions.filter(p => p !== permission))
        } else {
            setPermissions([...permissions, permission])
        }
    }

    const isMobile = useIsMobile()

    const renderFormContent = (onCancel: () => void) => (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Search & Selection */}
            <div className="space-y-4">
                <Label className="text-sm font-semibold text-muted-foreground">Truy vấn nhân sự</Label>
                <div className="relative group">
                    <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                    <Input
                        type="text"
                        placeholder="Nhập tên tài khoản hoặc email để tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 bg-card border-border rounded-md shadow-sm focus-visible:ring-primary font-medium transition-all text-foreground"
                    />
                </div>

                {loading && (
                    <div className="flex items-center gap-2 px-1">
                        <Loader2 className="size-3 animate-spin text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">Đang lục tìm hồ sơ...</span>
                    </div>
                )}

                {searchQuery.length >= 2 && !loading && users.length === 0 && (
                    <div className="px-1 text-xs font-semibold text-destructive">Không tìm thấy thực thể phù hợp</div>
                )}

                {users.length > 0 && (
                    <div className="space-y-2">
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger className="h-10 rounded-md border-border bg-card px-4 focus:ring-0 shadow-sm font-medium text-foreground">
                                <SelectValue placeholder="Xác nhận nhân sự từ danh sách" />
                            </SelectTrigger>
                            <SelectContent className="rounded-md border-border shadow-lg p-1 max-h-[250px]">
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id} className="rounded-sm h-auto focus:bg-accent">
                                        <div className="flex items-center gap-4 py-2">
                                            <Avatar className="size-10 rounded-md border border-border bg-muted shadow-sm transition-transform">
                                                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                                                    {user.email ? user.email.charAt(0).toUpperCase() : "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-0.5">
                                                <div className="font-bold text-foreground text-sm leading-none">{user.email || '(Không có email)'}</div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-[10px] font-semibold px-2 py-0.5 rounded-sm">ID: {user.id.slice(0, 8)}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Role & Permissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Label className="text-sm font-semibold text-muted-foreground">Vai trò Cộng tác</Label>
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="h-10 rounded-md border-border bg-card px-4 focus:ring-0 shadow-sm font-medium text-foreground">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-border shadow-lg p-1">
                            {['Copywriter', 'Designer', 'Marketer', 'TeamLeader', 'Vendor'].map(r => (
                                <SelectItem key={r} value={r} className="rounded-sm h-10 font-medium text-sm focus:bg-accent">{r}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] font-medium text-muted-foreground leading-relaxed uppercase tracking-wider">Phân quyền sẽ được AI tự động thiết lập dựa trên vai trò.</p>
                </div>

                <div className="space-y-4">
                    <Label className="text-sm font-semibold text-muted-foreground">Thẩm quyền hệ thống</Label>
                    <div className="h-10 bg-muted/30 rounded-md border border-border px-4 flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer shadow-sm" onClick={() => setShowPermissions(!showPermissions)}>
                        <div className="flex items-center gap-3">
                            <Key className="size-4 text-primary" />
                            <span className="text-sm font-bold text-foreground">{permissions.length} Phân quyền</span>
                        </div>
                        <Button type="button" variant="ghost" className="size-8 p-0 hover:bg-accent rounded-md transition-transform" style={{ transform: showPermissions ? 'rotate(90deg)' : 'none' }}>
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {showPermissions && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <TooltipProvider>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg border border-border bg-muted/50 max-h-64 overflow-y-auto scrollbar-hide">
                            {getPermissionsForRole(role).map((permission) => {
                                const info = getPermissionInfo(permission)
                                const isSelected = permissions.includes(permission)
                                return (
                                    <Tooltip key={permission}>
                                        <TooltipTrigger asChild>
                                            <div
                                                onClick={() => togglePermission(permission)}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer",
                                                    isSelected ? "border-primary bg-background shadow-sm" : "border-transparent bg-transparent hover:bg-accent"
                                                )}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => togglePermission(permission)}
                                                    className="size-4 rounded border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <span className="text-[11px] font-bold text-foreground truncate">
                                                    {info?.label || permission}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={5} className="rounded-md bg-foreground text-background border-none p-2 text-[11px] font-medium">
                                            <p>{info?.description || permission}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                        </div>
                    </TooltipProvider>
                    <div className="mt-4 flex gap-4 px-2">
                        <button type="button" className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setPermissions(getPermissionsForRole(role).slice())}>Thiết lập lại mặc định</button>
                        <button type="button" className="text-[11px] font-medium text-destructive hover:text-destructive/80 transition-colors" onClick={() => setPermissions([])}>Gỡ bỏ toàn bộ</button>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={onCancel} className="h-10 px-6 rounded-md font-semibold text-sm">Hủy bỏ</Button>
                <Button type="submit" disabled={adding || !selectedUserId} className="h-10 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all">
                    {adding ? "Đang xử lý..." : "Thêm vào Đội ngũ"}
                </Button>
            </div>
        </form>
    )

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-lg border-none shadow-2xl bg-popover">
                    <DrawerHeader className="flex-shrink-0 text-left p-6 pb-2">
                        <DrawerTitle className="text-xl font-bold tracking-tight text-foreground leading-none">Mời nhân sự</DrawerTitle>
                        <DrawerDescription className="text-sm font-medium text-muted-foreground mt-2 italic">Mở rộng mạng lưới cộng tác bằng cách mời thành viên mới.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-6 overflow-y-auto flex-1 pb-6">
                        {renderFormContent(() => onOpenChange(false))}
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col rounded-lg border-border p-0 shadow-lg bg-popover">
                <DialogHeader className="flex-shrink-0 p-8 pb-4">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground leading-none">Mời nhân sự</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-muted-foreground mt-2 italic">Kết nối các chuyên gia vào cấu trúc vận hành của Đội ngũ.</DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 px-8 pb-8">
                    {renderFormContent(() => onOpenChange(false))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
