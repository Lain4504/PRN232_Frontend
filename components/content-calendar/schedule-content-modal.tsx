"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProfileScheduleForm } from "./schedule-form-profile";
import { TeamScheduleForm } from "./schedule-form-team";

interface ScheduleContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId?: string;
  defaultDate?: string;
  defaultTime?: string;
  teamId?: string;
  selectedBrandId?: string;
}

export function ScheduleContentModal({
  isOpen,
  onClose,
  contentId,
  defaultDate,
  defaultTime,
  teamId,
  selectedBrandId
}: ScheduleContentModalProps) {
  const isMobile = useIsMobile();

  const title = "Lên lịch đăng bài";
  const description = "Chọn thời gian phù hợp để nội dung của bạn được đăng tải tự động.";

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto flex-1">
            {teamId ? (
              <TeamScheduleForm
                teamId={teamId}
                contentId={contentId}
                defaultDate={defaultDate}
                defaultTime={defaultTime}
                selectedBrandId={selectedBrandId}
                onSuccess={onClose}
              />
            ) : (
              <ProfileScheduleForm
                contentId={contentId}
                defaultDate={defaultDate}
                defaultTime={defaultTime}
                selectedBrandId={selectedBrandId}
                onSuccess={onClose}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 p-6 scrollbar-hide">
          {teamId ? (
            <TeamScheduleForm
              teamId={teamId}
              contentId={contentId}
              defaultDate={defaultDate}
              defaultTime={defaultTime}
              selectedBrandId={selectedBrandId}
              onSuccess={onClose}
            />
          ) : (
            <ProfileScheduleForm
              contentId={contentId}
              defaultDate={defaultDate}
              defaultTime={defaultTime}
              selectedBrandId={selectedBrandId}
              onSuccess={onClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
