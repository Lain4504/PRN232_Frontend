"use client"

import { useMemo, useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTeamsByVendor } from '@/hooks/use-teams'
import { MembersCount } from '@/components/pages/teams/MembersCount'
import { TeamCreateDialog } from '@/components/pages/teams/TeamCreateDialog'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, Eye } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

function TeamsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [vendorId, setVendorId] = useState('')
  const [loading, setLoading] = useState(true)
  const { data, isLoading, isError } = useTeamsByVendor(vendorId || undefined)
  const [openCreate, setOpenCreate] = useState(false)

  // Helper function để xác định status của team
  const getTeamStatus = (team: any) => {
    // Nếu có status từ backend, dùng nó
    if (team.status) return team.status;
    
    // Logic dựa vào IsDeleted: nếu đã xóa = Inactive, chưa xóa = Active
    if (team.isDeleted === true) return 'Inactive';
    if (team.isDeleted === false) return 'Active';
    
    // Nếu không có isDeleted, kiểm tra các trường khác có thể có
    if (team.deletedAt) return 'Inactive';
    
    // Logic dựa trên dữ liệu có sẵn:
    // 1. Kiểm tra nếu có updatedAt và khác với createdAt (có thể đã bị deactivate)
    if (team.updatedAt && team.updatedAt !== team.createdAt) {
      const daysSinceUpdate = Math.floor((Date.now() - new Date(team.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      // Nếu cập nhật lần cuối > 90 ngày, có thể là Inactive
      if (daysSinceUpdate > 90) return 'Inactive';
    }
    
    // 2. Kiểm tra thời gian tạo team
    const daysSinceCreated = Math.floor((Date.now() - new Date(team.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    // Team rất cũ (> 1 năm) có thể là Archived
    if (daysSinceCreated > 365) return 'Archived';
    
    // Team cũ (> 6 tháng) có thể là Inactive
    if (daysSinceCreated > 180) return 'Inactive';
    
    // Team mới hoặc vừa tạo = Active
    return 'Active';
  };

  useEffect(() => {
    const getVendorId = async () => {
      // Lấy vendorId từ URL params trước
      const urlVendorId = searchParams.get('vendorId')
      if (urlVendorId) {
        setVendorId(urlVendorId)
        setLoading(false)
        return
      }

      // Nếu không có trong URL, lấy từ localStorage
      const storedVendorId = localStorage.getItem('vendorId')
      if (storedVendorId) {
        setVendorId(storedVendorId)
        setLoading(false)
        return
      }

      // Cuối cùng, lấy từ user session
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Sử dụng user.id làm vendorId tạm thời
        setVendorId(session.user.id)
        // Lưu vào localStorage để lần sau sử dụng
        localStorage.setItem('vendorId', session.user.id)
      }
      setLoading(false)
    }

    getVendorId()
  }, [searchParams])

  const rows = useMemo(() => data || [], [data])

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Teams</h1>
        <Button size="sm" className="h-8 text-xs w-full sm:w-auto" disabled={!vendorId} onClick={() => setOpenCreate(true)}>
          Create Team
        </Button>
      </div>

      {loading && (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground bg-background/50">Loading vendor information...</div>
      )}

      {!loading && !vendorId && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm">
          <div>Unable to load vendor information. Please try logging in again.</div>
        </div>
      )}

      {!loading && vendorId && (
        <div className="overflow-x-auto border rounded-lg">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-auto">Name</TableHead>
                <TableHead className="hidden sm:table-cell py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-auto">Status</TableHead>
                <TableHead className="py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-auto">Members</TableHead>
                <TableHead className="hidden md:table-cell py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-auto">Created</TableHead>
                <TableHead className="text-right py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">Loading...</TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={5} className="py-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="text-sm text-destructive">Không thể tải danh sách teams.</div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Chưa có team nào. Hãy tạo team.</TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && rows.map((t) => {
                const teamStatus = getTeamStatus(t);
                return (
                <TableRow key={t.id} className="hover:bg-muted/50">
                  <TableCell className="py-3 px-3 font-medium truncate">{t.name}</TableCell>
                  <TableCell className="hidden sm:table-cell py-3 px-3">
                    <Badge variant={
                      teamStatus === 'Active' ? 'default' : 
                      teamStatus === 'Inactive' ? 'secondary' : 
                      teamStatus === 'Archived' ? 'destructive' : 
                      'outline'
                    } className="text-xs">
                      {teamStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <Badge variant="outline" className="text-xs"><MembersCount teamId={t.id} /> Members</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-3 px-3 font-mono text-sm">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-right w-16">
                    <div className="flex items-center justify-end">
                      <div className="hidden lg:flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => router.push(`/dashboard/teams/${t.id}`)}>
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </div>
                      <div className="lg:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/teams/${t.id}`)} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <TeamCreateDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        vendorId={vendorId || ''}
        onCreated={(teamId) => router.push(`/dashboard/teams/${teamId}`)}
      />
    </div>
  )
}

export default function TeamsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeamsPageContent />
    </Suspense>
  )
}