"use client"

import React, { useState } from "react"
import { AdCampaignResponse } from "@/lib/types/campaigns"
import { CampaignForm } from "./campaign-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { Rocket, X, Zap } from "lucide-react"

interface CampaignModalProps {
  mode: "create" | "edit";
  campaign?: AdCampaignResponse;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function CampaignModal({
  mode,
  campaign,
  open,
  onOpenChange,
  onSuccess,
  children,
}: CampaignModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    handleOpenChange(false);
  };

  const modalOpen = open !== undefined ? open : isOpen;
  const title = mode === "create" ? "Khởi tạo Chiến dịch" : "Hiệu chỉnh Chiến dịch";
  const description = mode === "create"
    ? "Thiết lập các tham số mục tiêu, ngân sách và thời gian cho chiến dịch quảng cáo mới."
    : "Cập nhật các cấu hình vận hành và phân bổ ngân sách cho chiến dịch.";

  if (isMobile) {
    return (
      <Drawer open={modalOpen} onOpenChange={handleOpenChange}>
        {children && (
          <DrawerTrigger asChild>
            {children}
          </DrawerTrigger>
        )}
        <DrawerContent className="max-h-[95vh] flex flex-col rounded-t-[3rem] border-none shadow-2xl bg-white">
          <DrawerHeader className="flex-shrink-0 text-left p-10 pb-4">
            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6 border border-slate-200">
              <Zap className="size-6" />
            </div>
            <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">{title}</DrawerTitle>
            <DrawerDescription className="text-sm font-medium text-slate-400 mt-2 italic">{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-10 overflow-y-auto flex-1 pb-10 scrollbar-hide">
            <CampaignForm
              mode={mode}
              campaign={campaign}
              open={modalOpen}
              onOpenChange={handleOpenChange}
              onSuccess={handleSuccess}
              isDrawer={true}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-[3rem] border-none p-0 shadow-2xl bg-white">
        <DialogHeader className="flex-shrink-0 p-12 pb-8">
          <div className="flex items-center justify-between">
            <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-0 border border-slate-200 shadow-sm">
              <Rocket className="size-8" />
            </div>
            <Button onClick={() => handleOpenChange(false)} variant="ghost" className="size-10 rounded-xl bg-slate-50 hover:bg-slate-100 p-0 text-slate-400">
              <X className="size-5" />
            </Button>
          </div>
          <div className="mt-8">
            <DialogTitle className="text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">{title}</DialogTitle>
            <DialogDescription className="text-base font-medium text-slate-500 mt-2 italic">{description}</DialogDescription>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-12 pb-12 scrollbar-hide">
          <CampaignForm
            mode={mode}
            campaign={campaign}
            open={modalOpen}
            onOpenChange={handleOpenChange}
            onSuccess={handleSuccess}
            isDrawer={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
