"use client"

import { useEffect, useMemo, useState } from 'react'
import { useAssignBrands, useTeam } from '@/hooks/use-teams'
import { getCurrentPermissions } from '@/lib/permissions'
import { useGetBrands } from '@/hooks/use-social-accounts'

export function AssignBrandsPanel({ teamId }: { teamId: string }) {
  const { data: team } = useTeam(teamId)
  const { data: brands } = useGetBrands()
  const { mutateAsync: assign, isPending } = useAssignBrands(teamId)
  const [selected, setSelected] = useState<string[]>([])
  const [allowed, setAllowed] = useState(true)
  useState(() => { getCurrentPermissions().then((p) => setAllowed(p.canAssignBrands)) })

  const brandOptions = useMemo(() => brands || [], [brands])

  useEffect(() => {
    if (team?.brands) {
      setSelected(team.brands.map(b => b.id))
    }
  }, [team?.brands])

  async function handleSave() {
    try {
      await assign({ brandIds: selected })
      alert('Cập nhật brands thành công')
    } catch (e) {
      alert('Không thể cập nhật brands')
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">Chọn brands gán cho team này, sau đó nhấn Lưu thay đổi.</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {brandOptions.map((b) => (
          <label key={b.id} className="flex items-center gap-2 rounded border p-2">
            <input
              type="checkbox"
              checked={selected.includes(b.id)}
              onChange={(e) => {
                if (e.target.checked) setSelected((s) => [...s, b.id])
                else setSelected((s) => s.filter((x) => x !== b.id))
              }}
            />
            <span>{b.name}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button className="rounded border px-3 py-2" onClick={() => history.back()} disabled={isPending}>Huỷ</button>
        <button className="rounded bg-black text-white px-3 py-2 disabled:opacity-50" onClick={handleSave} disabled={isPending || !allowed}>
          {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  )
}