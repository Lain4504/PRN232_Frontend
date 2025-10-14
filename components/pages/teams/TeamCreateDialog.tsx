"use client"

import { useEffect, useState } from 'react'
import { useCreateTeam } from '@/hooks/use-teams'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  vendorId: string
  onCreated?: (teamId: string) => void
}

export function TeamCreateDialog({ open, onOpenChange, vendorId, onCreated }: Props) {
  const { mutateAsync, isPending } = useCreateTeam()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setName('')
      setDescription('')
      setError(null)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const created = await mutateAsync({ name, description: description || undefined })
      onOpenChange(false)
      onCreated?.(created.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi'
      if (message.includes('401')) {
        window.location.href = '/login'
        return
      }
      setError('Không thể tạo team. Vui lòng kiểm tra các trường và thử lại.')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded bg-white p-4 shadow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Tạo team</h2>
          <button onClick={() => onOpenChange(false)} className="px-2 py-1">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Tên team</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="Nhập tên team"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border px-3 py-2"
              rows={3}
              placeholder="Mô tả ngắn (tuỳ chọn)"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="px-3 py-2 rounded border">Huỷ</button>
            <button
              type="submit"
              disabled={isPending}
              className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
            >
              {isPending ? 'Đang tạo...' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}