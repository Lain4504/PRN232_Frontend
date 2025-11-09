"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Loader2 } from "lucide-react";
import { ApprovalResponseDto } from "@/lib/types/aisam-types";
import { useChangeApprover, useAvailableApprovers } from "@/hooks/use-approvals";
import { toast } from "sonner";

interface ChangeApproverDialogProps {
  approval: ApprovalResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChangeApproverDialog({
  approval,
  isOpen,
  onClose
}: ChangeApproverDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const changeApproverMutation = useChangeApprover(approval?.id || "");
  const { data: availableUsers = [], isLoading: isLoadingUsers } = useAvailableApprovers(approval?.brandId);

  const handleSubmit = async () => {
    if (!approval || !selectedUserId) return;

    try {
      await changeApproverMutation.mutateAsync(selectedUserId);
      toast.success("Approver changed successfully");
      onClose();
      setSelectedUserId("");
    } catch (error) {
      console.error("Failed to change approver:", error);
      toast.error("Failed to change approver");
    }
  };

  const handleClose = () => {
    setSelectedUserId("");
    onClose();
  };

  if (!approval) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Approver</DialogTitle>
          <DialogDescription>
            Select a new approver for this approval request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current approval info */}
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm font-medium">Content: {approval.contentTitle}</div>
            <div className="text-xs text-muted-foreground">
              Brand: {approval.brandName} • Current Approver: {approval.approverEmail}
            </div>
          </div>

          {/* User selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New Approver</label>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm">Loading approvers...</span>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a new approver..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm">{user.name || user.email}</span>
                          {user.name && (
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {availableUsers.length === 0 && !isLoadingUsers && (
              <div className="text-sm text-muted-foreground text-center p-4">
                No available approvers found for this brand.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={changeApproverMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedUserId || changeApproverMutation.isPending || isLoadingUsers}
          >
            {changeApproverMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              "Change Approver"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}