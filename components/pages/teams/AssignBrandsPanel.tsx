"use client"

import { useEffect, useMemo, useState } from 'react'
import { useAssignBrands, useTeam } from '@/hooks/use-teams'
import { getCurrentPermissions } from '@/lib/permissions'
import { useGetBrands } from '@/hooks/use-social-accounts'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

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
    } catch {
      alert('Không thể cập nhật brands')
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Chọn brands gán cho team này, sau đó nhấn Lưu thay đổi.</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {brandOptions.map((b) => (
          <label key={b.id} className="flex items-center gap-3 rounded-lg border p-3 bg-background/50">
            <Checkbox
              checked={selected.includes(b.id)}
              onCheckedChange={(checked) => {
                if (checked) setSelected((s) => [...s, b.id])
                else setSelected((s) => s.filter((x) => x !== b.id))
              }}
            />
            <span className="text-sm">{b.name}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => history.back()} disabled={isPending}>Huỷ</Button>
        <Button size="sm" className="h-8 text-xs" onClick={handleSave} disabled={isPending || !allowed}>
          {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </div>
  )
}