"use client";

import {
    Home,
    Users,
    Settings,
    Building2,
    BarChart3,
    CreditCard,
    Shield,
    HelpCircle,
    FileText,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";

interface SidebarItem {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    href?: string;
}

interface OrganizationSidebarProps {
    activeItem?: string;
    organizationName?: string;
}

type SidebarMode = 'expanded' | 'collapsed' | 'expandOnHover';

export function OrganizationSidebar({
    activeItem = "Organizations",
    organizationName = "Organization"
}: OrganizationSidebarProps) {
    // Prevent hydration mismatch by using a safe default
    const displayName = organizationName || "O";
    const avatarLetter = displayName.charAt(0).toUpperCase() || "O";
    const [sidebarMode, setSidebarMode] = useState<SidebarMode>('expandOnHover');

    const sidebarItems: SidebarItem[] = [
        {
            icon: <Building2 className="h-4 w-4" />,
            label: "Organizations",
            active: activeItem === "Organizations",
            href: "/organizations"
        },
        {
            icon: <Users className="h-4 w-4" />,
            label: "Team"
        },
        {
            icon: <BarChart3 className="h-4 w-4" />,
            label: "Analytics"
        },
        {
            icon: <CreditCard className="h-4 w-4" />,
            label: "Billing"
        },
        {
            icon: <Shield className="h-4 w-4" />,
            label: "Security"
        },
        {
            icon: <Settings className="h-4 w-4" />,
            label: "Settings"
        }
    ];

    // Calculate sidebar width and behavior based on mode
    const getSidebarClasses = () => {
        switch (sidebarMode) {
            case 'expanded':
                return 'w-64';
            case 'collapsed':
                return 'w-16';
            case 'expandOnHover':
                return 'group w-16 hover:w-64';
            default:
                return 'group w-16 hover:w-64';
        }
    };

    const getTextClasses = () => {
        switch (sidebarMode) {
            case 'expanded':
                return 'opacity-100';
            case 'collapsed':
                return 'opacity-0';
            case 'expandOnHover':
                return 'opacity-0 group-hover:opacity-100';
            default:
                return 'opacity-0 group-hover:opacity-100';
        }
    };

    return (
        <div className={`${getSidebarClasses()} bg-white border-r border-gray-200 h-screen overflow-y-auto transition-all duration-300 ease-in-out relative`}>
            {/* Navigation Items */}
            <div className="p-3">
                <div className="space-y-1">
                    {sidebarItems.map((item, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors text-sm ${item.active
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            title={item.label}
                        >
                            <div className="flex-shrink-0">
                                {item.icon}
                            </div>
                            <span className={`${getTextClasses()} transition-opacity duration-300 whitespace-nowrap overflow-hidden`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar Control - Moved to bottom left */}
            <div className="absolute bottom-4 left-3 z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-48">
                        <div className="px-2 py-1.5 text-sm font-medium text-gray-500">Sidebar control</div>
                        <DropdownMenuRadioGroup value={sidebarMode} onValueChange={(value) => setSidebarMode(value as SidebarMode)}>
                            <DropdownMenuRadioItem value="expanded">
                                Expanded
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="collapsed">
                                Collapsed
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="expandOnHover">
                                Expand on hover
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}