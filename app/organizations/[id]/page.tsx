"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { OrganizationHeader } from "@/components/organization/organization-header";
import { ProjectSidebar } from "@/components/project-sidebar";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Database,
    Shield,
    HardDrive,
    Zap,
    ChevronDown
} from "lucide-react";

interface Organization {
    id: string;
    name: string;
    plan: string;
    status: string;
}

interface StatCard {
    title: string;
    icon: React.ReactNode;
    requests: number;
    subtitle: string;
    chartData: number[];
}

export default function OrganizationDetailPage() {
    // Hot reload test - this SHOULD update automatically now!
    const params = useParams();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [timeFilter, setTimeFilter] = useState("Last 60 minutes");

    const timeFilterOptions = [
        "Last 5 minutes",
        "Last 15 minutes",
        "Last 30 minutes",
        "Last 60 minutes",
        "Last 3 hours",
        "Last 6 hours",
        "Last 12 hours",
        "Last 24 hours",
        "Last 3 days",
        "Last 7 days"
    ];

    useEffect(() => {
        // Mock data - replace with actual API call
        const mockOrg: Organization = {
            id: params.id as string,
            name: "zy's Project",
            plan: "NANO",
            status: "Production"
        };

        setOrganization(mockOrg);
    }, [params.id]);

    const statCards: StatCard[] = [
        {
            title: "Database",
            icon: <Database className="h-5 w-5 text-gray-600" />,
            requests: 1,
            subtitle: "REST Requests",
            chartData: [0, 0, 0, 0, 1, 0, 0]
        },
        {
            title: "Auth",
            icon: <Shield className="h-5 w-5 text-gray-600" />,
            requests: 1,
            subtitle: "Auth Requests",
            chartData: [0, 0, 0, 0, 1, 0, 0]
        },
        {
            title: "Storage",
            icon: <HardDrive className="h-5 w-5 text-gray-600" />,
            requests: 0,
            subtitle: "Storage Requests",
            chartData: [0, 0, 0, 0, 0, 0, 0]
        },
        {
            title: "Realtime",
            icon: <Zap className="h-5 w-5 text-gray-600" />,
            requests: 0,
            subtitle: "Realtime Requests",
            chartData: [0, 0, 0, 0, 0, 0, 0]
        }
    ];

    if (!organization) {
        return (
            <div className="min-h-screen bg-gray-50">
                <OrganizationHeader currentPage="Loading..." />
                <div className="flex">
                    <div className="w-64 bg-white border-r border-gray-200 h-screen"></div>
                    <div className="flex-1 p-6">
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading project...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <OrganizationHeader currentPage={organization.name} />

            <div className="flex">
                {/* Sidebar */}
                <ProjectSidebar />

                {/* Main Content */}
                <div className="flex-1">
                    <div className="p-6">
                        {/* Project Header */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h1 className="text-2xl font-semibold text-gray-900">{organization.name}</h1>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {organization.plan}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="text-center">
                                            <div className="text-gray-500">Tables</div>
                                            <div className="text-xl font-bold">0</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-gray-500">Functions</div>
                                            <div className="text-xl font-bold">0</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-gray-500">Replicas</div>
                                            <div className="text-xl font-bold">0</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium">Project Status</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Time Filter */}
                        <div className="mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="flex items-center gap-2">
                                                {timeFilter}
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-48">
                                            {timeFilterOptions.map((option) => (
                                                <DropdownMenuItem
                                                    key={option}
                                                    onClick={() => setTimeFilter(option)}
                                                    className="cursor-pointer"
                                                >
                                                    {option}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <span className="text-sm text-gray-600">Statistics for {timeFilter.toLowerCase()}</span>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statCards.map((stat, index) => (
                                <Card key={index} className="relative">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center gap-2">
                                            {stat.icon}
                                            <CardTitle className="text-base font-medium">{stat.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600">{stat.subtitle}</div>
                                            <div className="text-2xl font-bold">{stat.requests}</div>

                                            {/* Mini Chart */}
                                            <div className="h-16 flex items-end gap-1 mt-4">
                                                {stat.chartData.map((value, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 bg-green-200 min-h-[2px] rounded-t"
                                                        style={{
                                                            height: value > 0 ? `${(value / Math.max(...stat.chartData)) * 100}%` : '2px'
                                                        }}
                                                    />
                                                ))}
                                            </div>

                                            {/* Time Labels */}
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Sep 25, 7:54pm</span>
                                                <span>Sep 25, 8:54pm</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}