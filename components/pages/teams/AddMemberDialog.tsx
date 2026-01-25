"use client"

import { useState, useEffect } from 'react'
import { useAddTeamMember } from '@/hooks/use-teams'
import { api, endpoints } from '@/lib/api'
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
import { Search, UserPlus, Shield, ChevronRight, X, UserSearch, Target, LayoutDashboard, Key } from 'lucide-react'
import { getPermissionsForRole, getPermissionInfo } from '@/lib/constants/team-roles'
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
                const response = await api.get<any>(url)
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

        const debounceTimer = setTimeout(searchUsers, 300)
        return () => clearTimeout(debounceTimer)
    }, [searchQuery])

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

    const AddMemberFormContent = ({ onCancel }: { onCancel: () => void }) => (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* User Search & Selection */}
            <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Truy vấn nhân sự</Label>
                <div className="relative group">
                    <UserSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                    <Input
                        type="text"
                        placeholder="Nhập tên tài khoản hoặc email để tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus-visible:ring-slate-100 font-medium transition-all"
                    />
                </div>

                {loading && (
                    <div className="flex items-center gap-2 px-4">
                        <Loader2 className="size-3 animate-spin text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đang lục tìm hồ sơ...</span>
                    </div>
                )}

                {searchQuery.length >= 2 && !loading && users.length === 0 && (
                    <div className="px-4 text-[10px] font-black uppercase tracking-widest text-rose-400">Không tìm thấy thực thể phù hợp</div>
                )}

                {users.length > 0 && (
                    <div className="space-y-2">
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 focus:ring-0 shadow-sm font-black text-slate-900 uppercase tracking-tight">
                                <SelectValue placeholder="Xác nhận nhân sự từ danh sách" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1 max-h-[250px]">
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id} className="rounded-xl h-14 focus:bg-slate-50">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="size-8 rounded-lg border border-slate-200">
                                                <AvatarFallback className="bg-slate-900 text-white font-black text-[10px]">
                                                    {user.email?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-black text-slate-900 text-xs truncate max-w-[280px]">{user.email}</span>
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
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vai trò Cộng tác</Label>
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 focus:ring-0 shadow-sm font-black text-slate-900 uppercase tracking-tight">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                            {['Copywriter', 'Designer', 'Marketer', 'TeamLeader', 'Vendor'].map(r => (
                                <SelectItem key={r} value={r} className="rounded-xl h-11 uppercase font-black text-[10px] tracking-widest focus:bg-slate-50">{r}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-relaxed">Phân quyền sẽ được AI tự động thiết lập dựa trên vai trò chiến lược.</p>
                </div>

                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thẩm quyền hệ thống</Label>
                    <div className="h-14 bg-slate-50 rounded-2xl border-2 border-slate-100 px-6 flex items-center justify-between group hover:border-slate-200 transition-all cursor-pointer" onClick={() => setShowPermissions(!showPermissions)}>
                        <div className="flex items-center gap-3">
                            <Key className="size-4 text-slate-400" />
                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{permissions.length} Phân quyền</span>
                        </div>
                        <Button type="button" variant="ghost" className="size-8 p-0 hover:bg-white rounded-lg transition-transform" style={{ transform: showPermissions ? 'rotate(90deg)' : 'none' }}>
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {showPermissions && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <TooltipProvider>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-6 rounded-[2rem] border-2 border-slate-100 bg-slate-50/50 max-h-64 overflow-y-auto scrollbar-hide">
                            {getPermissionsForRole(role).map((permission) => {
                                const info = getPermissionInfo(permission)
                                const isSelected = permissions.includes(permission)
                                return (
                                    <Tooltip key={permission}>
                                        <TooltipTrigger asChild>
                                            <div
                                                onClick={() => togglePermission(permission)}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                                                    isSelected ? "bg-white border-slate-900 shadow-sm" : "bg-transparent border-transparent hover:bg-slate-100"
                                                )}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => togglePermission(permission)}
                                                    className="size-4 rounded border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                                />
                                                <span className="text-[10px] font-black uppercase tracking-tight text-slate-900 truncate">
                                                    {info?.label || permission}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="rounded-lg bg-slate-900 text-white border-none p-2 text-[10px] font-bold">
                                            <p>{info?.description || permission}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                        </div>
                    </TooltipProvider>
                    <div className="mt-4 flex gap-4 px-2">
                        <button type="button" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors" onClick={() => setPermissions(getPermissionsForRole(role).slice())}>Thiết lập lại mặc định</button>
                        <button type="button" className="text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 transition-colors" onClick={() => setPermissions([])}>Gỡ bỏ toàn bộ</button>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={onCancel} className="h-14 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 font-black uppercase tracking-widest text-[10px] order-2 sm:order-1 flex-1 sm:flex-none sm:px-10">Hủy bỏ</Button>
                <Button type="submit" disabled={adding || !selectedUserId} className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 order-1 sm:order-2 flex-1 sm:flex-none sm:px-10">
                    {adding ? (
                        <>
                            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            Thêm vào Đội ngũ <ChevronRight className="ml-2 size-4" />
                        </>
                    )}
                </Button>
            </div>
        </form>
    )

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-[3rem] border-none shadow-2xl bg-white">
                    <DrawerHeader className="flex-shrink-0 text-left p-10 pb-4">
                        <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6 border border-slate-200">
                            <UserPlus className="size-6" />
                        </div>
                        <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Thêm Nhân sự</DrawerTitle>
                        <DrawerDescription className="text-sm font-medium text-slate-400 mt-2 italic">Chỉ định thành viên mới và thiết lập ma trận phân quyền.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-10 overflow-y-auto flex-1 pb-10">
                        <AddMemberFormContent onCancel={() => onOpenChange(false)} />
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-[3rem] border-none p-0 shadow-2xl bg-white">
                <DialogHeader className="flex-shrink-0 p-12 pb-8">
                    <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-8 border border-slate-200 shadow-sm">
                        <UserPlus className="size-8" />
                    </div>
                    <DialogTitle className="text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">Thêm Nhân sự</DialogTitle>
                    <DialogDescription className="text-base font-medium text-slate-500 mt-2 italic">Tích hợp thành viên mới vào luồng vận hành sản xuất nội dung của Đội ngũ.</DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 px-12 pb-12">
                    <AddMemberFormContent onCancel={() => onOpenChange(false)} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
