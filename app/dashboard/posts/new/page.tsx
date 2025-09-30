'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Loader2, ChevronDown, Check } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { fetchRest } from '@/lib/custom-api/rest-client'
import { endpoints } from '@/lib/custom-api/endpoints'
import { SocialAccount, SocialAccountsResponse } from '@/lib/provider/social-types'

type CreatePostBody = {
  userId: string
  socialAccountId: string
  socialTargetId: string
  message: string
  published: boolean
}

export default function NewPostPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [selectedTargetId, setSelectedTargetId] = useState<string>('')
  const [message, setMessage] = useState('')
  const [published, setPublished] = useState(true)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAccounts = async () => {
      if (!isAuthenticated || !user) return
      try {
        setLoading(true)
        setError(null)
        const { data, error } = await fetchRest<SocialAccountsResponse>(endpoints.socialAccountsByUser(user.id), {
          method: 'GET',
          requireAuth: true
        })
        if (error) throw new Error(error.message || 'Failed to load social accounts')
        if (data?.success) {
          setAccounts(data.data)
        } else {
          throw new Error('Failed to load social accounts')
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    loadAccounts()
  }, [isAuthenticated, user])

  const selectedAccount = useMemo(() => accounts.find(a => a.id === selectedAccountId) || null, [accounts, selectedAccountId])
  const targets = selectedAccount?.targets || []
  const selectedTarget = useMemo(() => targets.find(t => t.id === selectedTargetId) || null, [targets, selectedTargetId])

  // Auto-select first target when switching account
  useEffect(() => {
    if (targets.length > 0) {
      setSelectedTargetId((prev) => (targets.some(t => t.id === prev) ? prev : targets[0].id))
    } else {
      setSelectedTargetId('')
    }
  }, [selectedAccountId, accounts])

  const submit = async () => {
    if (!user) return
    if (!selectedAccountId) {
      alert('Please select a social account')
      return
    }
    if (!selectedTargetId) {
      alert('Please select a page/group')
      return
    }
    if (!message.trim()) {
      alert('Message is required')
      return
    }
    const body: CreatePostBody = {
      userId: user.id,
      socialAccountId: selectedAccountId,
      socialTargetId: selectedTargetId,
      message: message.trim(),
      published
    }
    try {
      setSubmitting(true)
      const { data, error } = await fetchRest<{ success?: boolean; message?: string }>(endpoints.createPost(), {
        method: 'POST',
        body,
        requireAuth: true
      })
      if (error) throw new Error(error.message || 'Failed to create post')
      if ((data as unknown as { success?: boolean })?.success !== false) {
        router.replace('/dashboard')
      } else {
        throw new Error((data as unknown as { message?: string })?.message || 'Failed to create post')
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSubmitting(false)
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
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
            <CardDescription>Choose account and page, compose a message, and publish.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => location.reload()} variant="outline">Try Again</Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Social Account</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="justify-between w-full">
                        <span>{selectedAccount ? `${selectedAccount.provider} • ${selectedAccount.providerUserId}` : 'Select account'}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width] max-h-72 overflow-auto">
                      <DropdownMenuLabel>Accounts</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {accounts.map(acc => (
                        <DropdownMenuItem key={acc.id} onClick={() => { setSelectedAccountId(acc.id); setSelectedTargetId('') }}>
                          <div className="flex items-center justify-between w-full">
                            <span className="capitalize">{acc.provider}</span>
                            {selectedAccountId === acc.id && <Check className="h-4 w-4" />}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Page / Target</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="justify-between w-full" disabled={!selectedAccount}>
                        <span>{selectedTarget ? selectedTarget.name : 'Select page'}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width] max-h-72 overflow-auto">
                      <DropdownMenuLabel>Pages</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                       {targets.map(t => (
                        <DropdownMenuItem key={t.id} onClick={() => setSelectedTargetId(t.id)}>
                          <div className="flex items-center justify-between w-full">
                            <span>{t.name}</span>
                            {selectedTargetId === t.id && <Check className="h-4 w-4" />}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                    {selectedAccount && targets.length === 0 && (
                      <div className="text-sm text-gray-500 flex items-center justify-between">
                        <span>No linked pages for this account.</span>
                        <Button variant="link" className="px-0" onClick={() => router.push('/social-accounts/select-pages?provider=facebook')}>Link pages</Button>
                      </div>
                    )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full resize-y" />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox checked={published} onCheckedChange={(v) => setPublished(Boolean(v))} />
                  <span className="text-sm">Published</span>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => router.back()} disabled={submitting}>Cancel</Button>
                  <Button onClick={submit} disabled={submitting}>
                    {submitting ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span> : 'Create Post'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


