"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Grid3X3, List, Filter, Users, Calendar } from "lucide-react";

interface Organization {
    id: string;
    name: string;
    type: string;
    plan: string;
    members: number;
    created: string;
    status: 'Active' | 'Inactive';
}

export default function OrganizationsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const organizations: Organization[] = [
        {
            id: '1',
            name: 'AISAM',
            type: 'Business',
            plan: 'Pro',
            members: 12,
            created: '2024-01-15',
            status: 'Active'
        },
        {
            id: '2',
            name: 'Marketing Team',
            type: 'Team',
            plan: 'Starter',
            members: 5,
            created: '2024-02-01',
            status: 'Active'
        },
        {
            id: '3',
            name: 'Development Hub',
            type: 'Technical',
            plan: 'Enterprise',
            members: 25,
            created: '2024-01-10',
            status: 'Active'
        }
    ];

    const filteredOrganizations = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                    <p className="text-sm text-gray-600 mt-1">Manage and view all organizations</p>
                </div>
                <Link href="/dashboard/organizations/new">
                    <Button className="mt-4 sm:mt-0">
                        <Plus className="w-4 h-4 mr-2" />
                        New Organization
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search organizations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <div className="flex border rounded-md">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="rounded-r-none"
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="rounded-l-none"
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Organizations List/Grid */}
            <div className="bg-white rounded-lg border">
                {filteredOrganizations.length > 0 ? (
                    viewMode === 'list' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left p-4 font-medium text-gray-900">Organization</th>
                                        <th className="text-left p-4 font-medium text-gray-900">Type</th>
                                        <th className="text-left p-4 font-medium text-gray-900">Plan</th>
                                        <th className="text-left p-4 font-medium text-gray-900">Members</th>
                                        <th className="text-left p-4 font-medium text-gray-900">Created</th>
                                        <th className="text-left p-4 font-medium text-gray-900">Status</th>
                                        <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrganizations.map((org) => (
                                        <tr key={org.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <Link href={`/dashboard/organizations/${org.id}`}>
                                                    <div className="font-medium text-blue-600 hover:text-blue-800">
                                                        {org.name}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="p-4 text-gray-900">{org.type}</td>
                                            <td className="p-4 text-gray-900">{org.plan}</td>
                                            <td className="p-4 text-gray-900">
                                                <div className="flex items-center">
                                                    <Users className="w-4 h-4 mr-1 text-gray-400" />
                                                    {org.members}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-900">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                    {org.created}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    org.status === 'Active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {org.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <Link href={`/dashboard/organizations/${org.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {filteredOrganizations.map((org) => (
                                <Link key={org.id} href={`/dashboard/organizations/${org.id}`}>
                                    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="font-semibold text-lg text-gray-900">{org.name}</h3>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                org.status === 'Active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {org.status}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div>Type: {org.type}</div>
                                            <div>Plan: {org.plan}</div>
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-1" />
                                                {org.members} members
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Created {org.created}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-500">No organizations found</div>
                    </div>
                )}
            </div>
        </div>
    );
}