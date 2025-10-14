"use client"

import { useMemo, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTeamsByVendor } from '@/hooks/use-teams'
import { MembersCount } from '@/components/pages/teams/MembersCount'
import { TeamCreateDialog } from '@/components/pages/teams/TeamCreateDialog'
import { createClient } from '@/lib/supabase/client'

export default function TeamsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [vendorId, setVendorId] = useState('')
  const [loading, setLoading] = useState(true)
  const { data, isLoading, isError } = useTeamsByVendor(vendorId || undefined)
  const [openCreate, setOpenCreate] = useState(false)

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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Teams</h1>
        <button
          className="rounded bg-black text-white px-3 py-2 disabled:opacity-50"
          disabled={!vendorId}
          onClick={() => setOpenCreate(true)}
        >
          CREATE TEAM
        </button>
      </div>

      {loading && (
        <div className="rounded border p-4 text-sm">
          Loading vendor information...
        </div>
      )}

      {!loading && !vendorId && (
        <div className="rounded border p-4 text-sm text-red-600">
          Unable to load vendor information. Please try logging in again.
        </div>
      )}

      {!loading && vendorId && (
        <div className="rounded border">
          <div className="grid grid-cols-5 gap-2 border-b p-2 text-sm font-medium bg-gray-50">
            <div>NAME</div>
            <div>STATUS</div>
            <div>MEMBERS</div>
            <div>CREATED</div>
            <div>ACTIONS</div>
          </div>
          {isLoading && (
            <div className="p-4 text-sm">Loading...</div>
          )}
          {isError && (
            <div className="p-4 text-sm text-red-600">
              Không thể tải danh sách teams.
              {vendorId && <div className="text-xs mt-1">Vendor ID: {vendorId}</div>}
            </div>
          )}
          {!isLoading && !isError && rows.length === 0 && (
            <div className="p-4 text-sm">Chưa có team nào. Hãy tạo team.</div>
          )}
          {!isLoading && !isError && rows.map((t) => (
            <div key={t.id} className="grid grid-cols-5 gap-2 p-2 text-sm items-center border-t">
              <div className="truncate">{t.name}</div>
              <div>
                <span className={`rounded px-2 py-1 text-xs border ${t.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                    t.status === 'Inactive' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                  {t.status}
                </span>
              </div>
              <div><MembersCount teamId={t.id} /></div>
              <div>{new Date(t.createdAt).toLocaleString()}</div>
              <div className="flex gap-2">
                <button
                  className="underline"
                  onClick={() => router.push(`/dashboard/teams/${t.id}`)}
                >
                  XEM
                </button>
              </div>
            </div>
          ))}
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