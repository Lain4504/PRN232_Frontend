"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export interface ActionItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
    disabled?: boolean;
}

interface ActionsDropdownProps {
    actions: ActionItem[];
    disabled?: boolean;
    size?: "sm" | "default" | "lg";
}

export function ActionsDropdown({
    actions,
    disabled = false,
    size = "sm"
}: ActionsDropdownProps) {
    if (actions.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size={size}
                    className="h-8 w-8 p-0 rounded-lg border border-border bg-card backdrop-blur-sm hover:bg-muted/50 data-[state=open]:bg-muted/50 shadow-sm"
                    disabled={disabled}
                >
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                {actions.map((action, index) => {
                    const needsSeparator =
                        index > 0 &&
                        action.variant === "destructive" &&
                        actions[index - 1].variant !== "destructive";

                    return (
                        <React.Fragment key={index}>
                            {needsSeparator && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                                onClick={action.onClick}
                                disabled={action.disabled}
                                variant={action.variant}
                                className="cursor-pointer"
                            >
                                {action.icon && (
                                    <span className="mr-2 h-4 w-4 flex items-center justify-center">
                                        {action.icon}
                                    </span>
                                )}
                                {action.label}
                            </DropdownMenuItem>
                        </React.Fragment>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
