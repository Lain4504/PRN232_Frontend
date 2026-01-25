"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar } from "lucide-react";
import { ProfileScheduleForm } from "./schedule-form-profile";
import { TeamScheduleForm } from "./schedule-form-team";
import { cn } from "@/lib/utils";

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
        <DrawerContent className="max-h-[90vh] flex flex-col bg-background/80 backdrop-blur-xl border-t border-white/10">
          <DrawerHeader className="flex-shrink-0 text-left border-b border-white/5 pb-4">
            <DrawerTitle className="flex items-center gap-3 font-fira-sans text-xl uppercase tracking-tight">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <Calendar className="size-5" />
              </div>
              Initialize Sequence
            </DrawerTitle>
            <DrawerDescription className="font-light">
              Schedule content distribution across selected channels
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1 py-4">
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
          <DrawerFooter className="flex-shrink-0 pt-2 border-t border-white/5">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Abort Sequence</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-background/80 backdrop-blur-2xl border-white/10 shadow-2xl p-0 gap-0">
        <DialogHeader className="flex-shrink-0 p-6 border-b border-white/5 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <DialogTitle className="flex items-center gap-3 font-fira-sans text-xl uppercase tracking-tight text-foreground">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-sm">
              <Calendar className="size-5" />
            </div>
            Initialize Content Sequence
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-light ml-1">
            Configure deployment parameters for your content asset.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
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
