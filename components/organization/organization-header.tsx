"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HelpCircle, MessageCircle, ChevronsUpDown, Search, Plus, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrganizationHeaderProps {
    currentPage?: string;
    currentOrganization?: string;
}

export function OrganizationHeader({
    currentPage = "Organizations",
    currentOrganization = "khanhsveehjhj"
}: OrganizationHeaderProps) {
    const router = useRouter();

    const handleNewOrganization = () => {
        router.push("/organizations/new");
    };

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* AISAM Logo */}
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                    </div>

                    <span className="text-gray-700 font-medium">{currentPage}</span>

                    {/* Organization Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-1 px-2 py-1 hover:bg-gray-50 data-[state=open]:bg-gray-50">
                                <ChevronsUpDown className="h-4 w-4 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-80 sm:w-80 w-72">
                            <div className="p-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Find organization..."
                                        className="pl-10 h-9 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base"
                                    />
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center gap-2 px-2 py-3">
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm sm:text-base truncate">{currentOrganization}</div>
                                </div>
                                <Check className="h-4 w-4 text-gray-700 flex-shrink-0" />
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center gap-2 px-2 py-3">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-700 text-sm sm:text-base">All Organizations</div>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="flex items-center gap-2 p-3 px-2 font-medium text-gray-700 cursor-pointer text-sm sm:text-base"
                                onClick={handleNewOrganization}
                            >
                                <Plus className="h-4 w-4 flex-shrink-0" />
                                <span>New organization</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Feedback</span>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <HelpCircle className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MessageCircle className="h-4 w-4 text-gray-600" />
                    </Button>
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">Z</span>
                    </div>
                </div>
            </div>
        </div>
    );
}