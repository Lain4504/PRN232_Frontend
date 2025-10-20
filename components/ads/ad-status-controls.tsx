"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, Square } from "lucide-react";
import { useUpdateAdStatus } from "@/hooks/use-ads";
import type { AdStatus } from "@/lib/types/ads";
import { toast } from "sonner";

interface AdStatusControlsProps {
  adId: string;
  adSetId?: string;
  status?: AdStatus;
}

export function AdStatusControls({ adId, adSetId, status }: AdStatusControlsProps) {
  const updateStatus = useUpdateAdStatus(adId, adSetId);

  const setStatus = async (next: AdStatus) => {
    try {
      await updateStatus.mutateAsync({ status: next });
      toast.success(`Ad ${next.toLowerCase()}`);
    } catch (e) {
      toast.error("Failed to update ad status");
      console.error(e);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => setStatus("ACTIVE")} disabled={status === "ACTIVE"}>
        <Play className="mr-2 h-4 w-4" /> Start
      </Button>
      <Button size="sm" variant="outline" onClick={() => setStatus("PAUSED")} disabled={status === "PAUSED"}>
        <Pause className="mr-2 h-4 w-4" /> Pause
      </Button>
      <Button size="sm" variant="destructive" onClick={() => setStatus("STOPPED")} disabled={status === "STOPPED"}>
        <Square className="mr-2 h-4 w-4" /> Stop
      </Button>
    </div>
  );
}


