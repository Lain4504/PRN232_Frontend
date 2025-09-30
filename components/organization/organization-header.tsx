"use client";

import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle } from "lucide-react";

interface OrganizationHeaderProps {
    currentPage?: string;
}

export function OrganizationHeader({ currentPage = "Organizations" }: OrganizationHeaderProps) {
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* AISAM Logo */}
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <span className="text-gray-700 font-medium">{currentPage}</span>
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