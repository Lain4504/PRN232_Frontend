"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar } from "lucide-react";
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

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Content
            </DrawerTitle>
            <DrawerDescription>
              Schedule approved content for publishing across multiple platforms
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
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
          <DrawerFooter className="flex-shrink-0 pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Content
          </DialogTitle>
          <DialogDescription>
            Schedule approved content for publishing across multiple platforms
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
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
