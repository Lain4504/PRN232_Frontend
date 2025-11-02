"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { useContentPublish } from "@/hooks/use-content-publish";

interface ContentPublishButtonProps {
  contentId: string;
  brandId?: string;
  onPublish: (contentId: string, integrationId: string) => Promise<void>;
  onOpenPreview?: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
  showText?: boolean;
}

export function ContentPublishButton({
  contentId,
  brandId,
  onPublish,
  onOpenPreview,
  disabled = false,
  isProcessing = false,
  size = "default",
  className = "bg-green-600 hover:bg-green-700",
  showText = true,
}: ContentPublishButtonProps) {
  const { handlePublish, integrationsLoading, canPublish } = useContentPublish({
    brandId,
    contentId,
    onPublish,
    disabled: disabled || isProcessing,
  });

  const handleClick = () => {
    if (onOpenPreview) {
      onOpenPreview();
    } else {
      handlePublish();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isProcessing || (onOpenPreview ? false : !canPublish)}
      size={size}
      className={className}
    >
      <Share className={`${showText ? 'mr-1' : ''} ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
      {showText && "Publish Content"}
    </Button>
  );
}

