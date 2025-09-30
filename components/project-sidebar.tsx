"use client";

import {
    Home,
    Table,
    Database,
    Shield,
    HardDrive,
    Zap,
    BarChart3,
    HelpCircle,
    FileText,
    Puzzle,
    Settings
} from "lucide-react";

interface SidebarItem {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    hasSubmenu?: boolean;
}

interface ProjectSidebarProps {
    activeItem?: string;
}

export function ProjectSidebar({ activeItem = "Project overview" }: ProjectSidebarProps) {
    const sidebarItems: SidebarItem[] = [
        {
            icon: <Home className="h-4 w-4" />,
            label: "Project overview",
            active: activeItem === "Project overview"
        },
        {
            icon: <Table className="h-4 w-4" />,
            label: "Table Editor"
        },
        {
            icon: <Database className="h-4 w-4" />,
            label: "SQL Editor"
        },
        {
            icon: <Database className="h-4 w-4" />,
            label: "Database"
        },
        {
            icon: <Shield className="h-4 w-4" />,
            label: "Authentication"
        },
        {
            icon: <HardDrive className="h-4 w-4" />,
            label: "Storage"
        },
        {
            icon: <Zap className="h-4 w-4" />,
            label: "Edge Functions"
        },
        {
            icon: <Zap className="h-4 w-4" />,
            label: "Realtime"
        },
        {
            icon: <HelpCircle className="h-4 w-4" />,
            label: "Advisors"
        },
        {
            icon: <BarChart3 className="h-4 w-4" />,
            label: "Reports"
        },
        {
            icon: <FileText className="h-4 w-4" />,
            label: "Logs"
        },
        {
            icon: <FileText className="h-4 w-4" />,
            label: "API Docs"
        },
        {
            icon: <Puzzle className="h-4 w-4" />,
            label: "Integrations"
        },
        {
            icon: <Settings className="h-4 w-4" />,
            label: "Project Settings"
        }
    ];

    return (
        <div className="group w-16 hover:w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto transition-all duration-300 ease-in-out">
            <div className="p-3">
                <div className="space-y-1">
                    {sidebarItems.map((item, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm ${item.active
                                ? 'bg-green-50 text-green-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            title={item.label}
                        >
                            <div className="flex-shrink-0">
                                {item.icon}
                            </div>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}