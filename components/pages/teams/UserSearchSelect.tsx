"use client"

import { useState, useEffect } from 'react'
import { api, endpoints } from '@/lib/api'
import { User } from '@/lib/types/aisam-types'

interface Props {
    value: string
    onChange: (userId: string) => void
    placeholder?: string
    className?: string
}

export function UserSearchSelect({ onChange, placeholder = "Search users...", className = "" }: Props) {
    const [searchTerm, setSearchTerm] = useState('')
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    // Search users when searchTerm changes
    useEffect(() => {
        if (searchTerm.length < 2) {
            setUsers([])
            return
        }

        const searchUsers = async () => {
            setLoading(true)
            try {
                const url = `${endpoints.userSearch}?searchTerm=${encodeURIComponent(searchTerm)}&page=1&pageSize=10`
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response = await api.get<any>(url)

                // Backend returns PagedResult directly: { data: User[], totalCount, page, ... }
                if (response.data && Array.isArray(response.data.data)) {
                    const userData = response.data.data
                    setUsers(userData)
                } else {
                    setUsers([])
                }
            } catch (error) {
                setUsers([])
            } finally {
                setLoading(false)
            }
        }

        const debounceTimer = setTimeout(searchUsers, 300)
        return () => clearTimeout(debounceTimer)
    }, [searchTerm])

    const handleSelectUser = (user: User) => {
        setSelectedUser(user)
        setSearchTerm(`${user.email}`)
        setShowDropdown(false)
        onChange(user.id)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setShowDropdown(true)
        if (!e.target.value) {
            setSelectedUser(null)
            onChange('')
        }
    }

    return (
        <div className={`relative ${className}`}>
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                placeholder={placeholder}
                className="w-full rounded border px-3 py-2"
                autoComplete="off"
            />

            {showDropdown && searchTerm.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {loading && (
                        <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                    )}

                    {!loading && users.length === 0 && searchTerm.length >= 2 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            No users found (users.length: {users.length})
                        </div>
                    )}

                    {!loading && users.map((user, index) => {
                        return (
                            <button
                                key={user.id}
                                onClick={() => handleSelectUser(user)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                <div className="font-medium">{user.email}</div>
                                <div className="text-sm text-gray-500">
                                    Created: {new Date(user.createdAt).toLocaleDateString()}
                                    {user.socialAccountsCount > 0 && ` • ${user.socialAccountsCount} social accounts`}
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}