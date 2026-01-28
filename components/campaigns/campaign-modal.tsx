"use client"

import React, { useState } from "react"
import { AdCampaignResponse } from "@/lib/types/campaigns"
import { CampaignForm } from "./campaign-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

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
  const title = mode === "create" ? "Tạo chiến dịch" : "Chỉnh sửa chiến dịch";
  const description = mode === "create"
    ? "Thiết lập mục tiêu, ngân sách và thời gian cho chiến dịch mới."
    : "Cập nhật thông tin và cấu hình cho chiến dịch quảng cáo.";

  if (isMobile) {
    return (
      <Drawer open={modalOpen} onOpenChange={handleOpenChange}>
        {children && (
          <DrawerTrigger asChild>
            {children}
          </DrawerTrigger>
        )}
        <DrawerContent className="max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto flex-1">
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 p-6">
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
