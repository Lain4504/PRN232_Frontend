"use client"

import { useEffect, useMemo, useState } from 'react'
import { useAssignBrands, useTeam } from '@/hooks/use-teams'
import { useGetBrands } from '@/hooks/use-social-accounts'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export function AssignBrandsPanel({ teamId }: { teamId: string; onClose?: () => void }) {
  const { data: team } = useTeam(teamId)
  const { data: brands } = useGetBrands()
  const { mutateAsync: assign, isPending } = useAssignBrands(teamId)
  const [selected, setSelected] = useState<string[]>([])
  const [allowed] = useState(true)

  const brandOptions = useMemo(() => brands || [], [brands])

  useEffect(() => {
    if (team?.brands) {
      setSelected(team.brands.map(b => b.id))
    }
  }, [team?.brands])

  async function handleSave() {
    try {
      await assign({ brandIds: selected })
      toast.success('Update brands successfully!', {
        description: 'Brands have been assigned to the team.',
        duration: 3000,
      })
    } catch {
      toast.error('Unable to update brands', {
        description: 'Unable to update brands for the team.',
        duration: 4000,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Choose brands to assign to this team, then click Save changes.</div>
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
        <Button size="sm" className="w-full md:w-auto h-8 text-xs" onClick={handleSave} disabled={isPending || !allowed}>
          {isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}