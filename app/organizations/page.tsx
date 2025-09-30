"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Grid3X3, List, Filter, Users, Calendar } from "lucide-react";
import { OrganizationHeader } from "@/components/organization/organization-header";
import { OrganizationSidebar } from '@/components/organization/organization-sidebar';

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
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <OrganizationHeader currentPage="Organizations" />

            {/* Mobile Sidebar - Horizontal bar */}
            <div className="lg:hidden bg-gray-800 text-white">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                className="p-1"
                                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                            >
                                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                                    <div className="w-4 h-0.5 bg-white"></div>
                                    <div className="w-4 h-0.5 bg-white"></div>
                                    <div className="w-4 h-0.5 bg-white"></div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    ></div>

                    {/* Sidebar Panel */}
                    <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                                <button
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                    className="p-2 rounded-md hover:bg-gray-100"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Sidebar Content */}
                            <nav className="space-y-2">
                                <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                    </svg>
                                    Projects
                                </a>
                                <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Team
                                </a>
                                <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    Integrations
                                </a>
                                <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Usage
                                </a>
                                <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Billing
                                </a>
                                <a href="#" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Organization settings
                                </a>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            <div className='flex flex-1 overflow-hidden'>
                {/* Desktop Sidebar - Vertical on left */}
                <div className="hidden lg:block">
                    <OrganizationSidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-auto">
                    {/* Title */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
                    </div>

                    {/* Controls Row */}
                    <div className="mb-6">
                        {/* Mobile Layout - All in one row */}
                        <div className="block sm:hidden">
                            <div className="flex items-center gap-2">
                                {/* Search Bar - Flexible width */}
                                <div className="relative flex-1 min-w-0">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 text-sm"
                                    />
                                </div>

                                {/* Filter Button - Icon only */}
                                <Button variant="outline" size="sm" className="px-2 border-dashed bg-transparent">
                                    <Filter className="h-4 w-4" />
                                </Button>

                                {/* View Toggle */}
                                <div className="flex rounded-md border">
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="rounded-r-none border-r-0 px-2"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="rounded-l-none px-2"
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* New Organization Button */}
                                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white px-3">
                                    <Link href="/organizations/new">
                                        <Plus className="h-4 w-4 mr-1" />
                                        New
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Desktop Layout - All in one row */}
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-4">
                                {/* Search Bar - Flexible width */}
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search for an organization"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* Filter Button */}
                                <Button variant="outline" size="sm" className="border-dashed bg-transparent">
                                    <Filter className="h-4 w-4" />
                                </Button>

                                {/* Spacer */}
                                <div className="flex-1"></div>

                                {/* View Toggle */}
                                <div className="flex rounded-md border">
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="rounded-r-none border-r-0"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="rounded-l-none"
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* New Organization Button */}
                                <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                                    <Link href="/organizations/new">
                                        <Plus className="h-4 w-4 mr-2" />
                                        New organization
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {viewMode === 'list' ? (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {/* Scrollable Table View for all screens */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                                                Name
                                            </th>
                                            <th className="px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                Type
                                            </th>
                                            <th className="px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                Plan
                                            </th>
                                            <th className="px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                Members
                                            </th>
                                            <th className="px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] hidden sm:table-cell">
                                                Created
                                            </th>
                                            <th className="px-3 md:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredOrganizations.map((org) => (
                                            <tr
                                                key={org.id}
                                                className="hover:bg-gray-50 cursor-pointer"
                                                onClick={() => window.location.href = `/organizations/${org.id}`}
                                            >
                                                <td className="px-3 md:px-4 lg:px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 bg-green-600 rounded-md flex items-center justify-center text-white font-semibold text-sm mr-3 flex-shrink-0">
                                                            {org.name.charAt(0)}
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900 truncate">
                                                            {org.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 md:px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {org.type}
                                                </td>
                                                <td className="px-3 md:px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {org.plan}
                                                </td>
                                                <td className="px-3 md:px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Users className="h-4 w-4 mr-1" />
                                                        {org.members}
                                                    </div>
                                                </td>
                                                <td className="px-3 md:px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        <span className="hidden md:inline">{new Date(org.created).toLocaleDateString()}</span>
                                                        <span className="md:hidden">{new Date(org.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 md:px-4 lg:px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${org.status === 'Active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {org.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                            {filteredOrganizations.map((org) => (
                                <div
                                    key={org.id}
                                    className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => window.location.href = `/organizations/${org.id}`}
                                >
                                    <div className="flex items-center mb-3 lg:mb-4">
                                        <div className="h-8 w-8 lg:h-10 lg:w-10 bg-green-600 rounded-md flex items-center justify-center text-white font-semibold mr-3">
                                            {org.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">{org.name}</h3>
                                            <p className="text-xs lg:text-sm text-gray-500">{org.type}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 lg:space-y-2">
                                        <div className="flex justify-between text-xs lg:text-sm">
                                            <span className="text-gray-500">Plan:</span>
                                            <span className="font-medium">{org.plan}</span>
                                        </div>
                                        <div className="flex justify-between text-xs lg:text-sm">
                                            <span className="text-gray-500">Members:</span>
                                            <span className="font-medium">{org.members}</span>
                                        </div>
                                        <div className="flex justify-between text-xs lg:text-sm">
                                            <span className="text-gray-500">Status:</span>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${org.status === 'Active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {org.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredOrganizations.length === 0 && (
                        <div className="text-center py-8 lg:py-12">
                            <div className="text-gray-500 text-sm lg:text-base">No organizations found</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}