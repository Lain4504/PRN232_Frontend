"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar, X, Rocket } from "lucide-react";
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

  const title = "Lập lịch Phân phối";
  const description = "Xác định thời điểm chính xác để tài sản số của bạn tiếp cận khách hàng tiềm năng.";

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[95vh] flex flex-col rounded-t-[3rem] border-none shadow-2xl bg-white">
          <DrawerHeader className="flex-shrink-0 text-left p-10 pb-4">
            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6 border border-slate-200">
              <Calendar className="size-6" />
            </div>
            <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">{title}</DrawerTitle>
            <DrawerDescription className="text-sm font-medium text-slate-400 mt-2 italic">{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-10 overflow-y-auto flex-1 pb-10 scrollbar-hide">
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border-none p-0 shadow-2xl bg-white">
        <DialogHeader className="flex-shrink-0 p-12 pb-8">
          <div className="flex items-center justify-between">
            <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-0 border border-slate-200 shadow-sm">
              <Calendar className="size-8" />
            </div>
            <Button onClick={onClose} variant="ghost" className="size-10 rounded-xl bg-slate-50 hover:bg-slate-100 p-0 text-slate-400">
              <X className="size-5" />
            </Button>
          </div>
          <div className="mt-8">
            <DialogTitle className="text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">{title}</DialogTitle>
            <DialogDescription className="text-base font-medium text-slate-500 mt-2 italic">{description}</DialogDescription>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-12 pb-12 scrollbar-hide">
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
