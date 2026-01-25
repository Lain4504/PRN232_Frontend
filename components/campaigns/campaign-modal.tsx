"use client";

import React from "react";
import { AdCampaignResponse } from "@/lib/types/campaigns";
import { CampaignForm } from "./campaign-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("common");

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

  if (isMobile) {
    return (
      <Drawer open={modalOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          {children}
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 text-left">
            <DrawerTitle>
              {mode === "create" ? t("campaigns.modal.createTitle") : t("campaigns.modal.editTitle")}
            </DrawerTitle>
            <DrawerDescription>
              {mode === "create"
                ? t("campaigns.modal.createDescription")
                : t("campaigns.modal.editDescription")}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
            <CampaignForm
              mode={mode}
              campaign={campaign}
              open={modalOpen}
              onOpenChange={handleOpenChange}
              onSuccess={handleSuccess}
              isDrawer={true}
            />
          </div>
          <DrawerFooter className="flex-shrink-0 pt-2">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">{t("campaigns.modal.cancel")}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {mode === "create" ? t("campaigns.modal.createTitle") : t("campaigns.modal.editTitle")}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? t("campaigns.modal.createDescription")
              : t("campaigns.modal.editDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
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
