'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Loader2, Search, CheckCircle2 } from 'lucide-react'
import { fetchRest } from '@/lib/custom-api/rest-client'
import { endpoints } from '@/lib/custom-api/endpoints'
import { AvailableTargetsResponse, LinkSelectedResponse } from '@/lib/provider/social-types'
import { useAuth } from '@/hooks/use-auth'

export default function SelectPagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  const provider = (searchParams.get('provider') || 'facebook') as 'facebook'

  const [targets, setTargets] = useState<AvailableTargetsResponse['data']['targets']>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLinking, setIsLinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allSelected = useMemo(() => {
    const filtered = targets.filter(t => filterFn(t, search))
    return filtered.length > 0 && filtered.every(t => selected[t.providerTargetId])
  }, [targets, selected, search])

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected])

  useEffect(() => {
    const loadTargets = async () => {
      if (!isAuthenticated || !user) return
      try {
        setIsLoading(true)
        setError(null)
        const { data, error } = await fetchRest<AvailableTargetsResponse>(endpoints.availableTargets(provider), {
          method: 'GET',
          requireAuth: true
        })
        if (error) throw new Error(error.message || 'Failed to load available targets')
        if (data?.success) {
          setTargets(data.data.targets || [])
        } else {
          throw new Error('Failed to load available targets')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    loadTargets()
  }, [provider, isAuthenticated, user])

  const toggleSelectAll = () => {
    const filtered = targets.filter(t => filterFn(t, search))
    const newSelected: Record<string, boolean> = { ...selected }
    if (allSelected) {
      filtered.forEach(t => { newSelected[t.providerTargetId] = false })
    } else {
      filtered.forEach(t => { newSelected[t.providerTargetId] = true })
    }
    setSelected(newSelected)
  }

  const toggleSelect = (providerTargetId: string) => {
    setSelected(prev => ({ ...prev, [providerTargetId]: !prev[providerTargetId] }))
  }

  const handleLinkSelected = async () => {
    if (!user) return
    const providerTargetIds = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k)
    if (providerTargetIds.length === 0) {
      alert('Please select at least one page.')
      return
    }
    try {
      setIsLinking(true)
      const { data, error } = await fetchRest<LinkSelectedResponse>(endpoints.linkSelectedTargets(), {
        method: 'POST',
        body: {
          userId: user.id,
          provider,
          providerTargetIds
        },
        requireAuth: true
      })
      if (error) throw new Error(error.message || 'Failed to link selected pages')
      if (data?.success) {
        // Navigate back to social accounts management view
        router.replace('/social-accounts')
      } else {
        throw new Error('Failed to link selected pages')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLinking(false)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">Please log in to continue.</p>
              <Button asChild>
                <a href="/login">Go to Login</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Select Pages to Link</h1>
          <p className="text-gray-600">Provider: <span className="capitalize">{provider}</span></p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Pages</CardTitle>
            <CardDescription>
              Choose which pages to link to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => router.refresh()} variant="outline">Try Again</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Search pages..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <Button variant="outline" onClick={toggleSelectAll}>
                    {allSelected ? 'Deselect all' : 'Select all'}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  {targets.filter(t => filterFn(t, search)).map(t => (
                    <div key={t.providerTargetId} className="flex items-center gap-3 p-2 rounded border bg-white">
                      <Checkbox
                        checked={!!selected[t.providerTargetId]}
                        onCheckedChange={() => toggleSelect(t.providerTargetId)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={t.profilePictureUrl} />
                        <AvatarFallback>{t.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{t.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{t.type} • {t.category || 'No category'}</div>
                      </div>
                      {selected[t.providerTargetId] && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ))}
                  {targets.filter(t => filterFn(t, search)).length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-6">No pages found.</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-gray-600">Selected: {selectedCount}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.back()} disabled={isLinking}>Cancel</Button>
                    <Button onClick={handleLinkSelected} disabled={isLinking || selectedCount === 0}>
                      {isLinking ? (
                        <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Linking...</span>
                      ) : 'Link selected'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function filterFn(t: AvailableTargetsResponse['data']['targets'][number], q: string) {
  if (!q) return true
  const s = q.toLowerCase().trim()
  return (
    t.name.toLowerCase().includes(s) ||
    (t.category || '').toLowerCase().includes(s)
  )
}


