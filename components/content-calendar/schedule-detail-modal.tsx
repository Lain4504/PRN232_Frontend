"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetSocialAccounts } from "@/hooks/use-social-accounts";
import type { ContentCalendar } from "@/lib/types/omniadly-types";
import {
  Calendar,
  Clock,
  FileText,
  Building2,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  X
} from "lucide-react";

interface ScheduleDetailModalProps {
  schedule: ContentCalendar | null;
  isOpen: boolean;
  onClose: () => void;
}

function ScheduleDetailContent({ schedule }: { schedule: ContentCalendar | null }) {
  const { data: socialAccounts } = useGetSocialAccounts();

  if (!schedule) return null;

  // Map integrationIds to actual platform names
  const platforms = schedule.integrationIds?.map(integrationId => {
    const target = socialAccounts?.flatMap(account => 
      account.targets?.filter(t => t.id === integrationId) || []
    )?.[0];
    return target || null;
  }).filter(Boolean) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case 'published':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800">
            <X className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const { date, time } = formatDate(schedule.scheduledDate);

  return (
    <div className="space-y-4">
      {/* Content Info */}
      <Card className="border-0 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <CardTitle className="text-lg font-bold line-clamp-2">
                {schedule.contentTitle || 'Untitled Content'}
              </CardTitle>
            </div>
            {getStatusBadge(schedule.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span className="font-medium">{schedule.brandName || 'Unknown Brand'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Info */}
      <Card className="border-0 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">{date}</div>
              <div className="text-xs text-muted-foreground">{time} ({schedule.timezone})</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platforms */}
      {schedule.integrationIds && schedule.integrationIds.length > 0 && (
        <Card className="border-0 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Platforms ({schedule.integrationIds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {platforms.length > 0 ? (
              <div className="space-y-2">
                {platforms.map((target) => (
                  target && (
                    <div key={target.id} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
                      {target.profilePictureUrl && (
                        <Avatar className="h-8 w-8 ring-1 ring-muted shrink-0">
                          <AvatarImage src={target.profilePictureUrl} alt={target.name} />
                          <AvatarFallback className="text-xs font-semibold">
                            {target.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{target.name}</div>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <Badge variant="outline" className="text-xs">
                            {target.provider || target.type}
                          </Badge>
                          {target.category && (
                            <span className="text-xs text-muted-foreground truncate">
                              {target.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {schedule.integrationIds.map((integrationId, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    Platform {index + 1}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function ScheduleDetailModal({ schedule, isOpen, onClose }: ScheduleDetailModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Content Details
            </DrawerTitle>
            <DrawerDescription>
              View details of scheduled content
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
            <ScheduleDetailContent schedule={schedule} />
          </div>
          <DrawerFooter className="flex-shrink-0 pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Content Details
          </DialogTitle>
          <DialogDescription>
            View details of scheduled content
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          <ScheduleDetailContent schedule={schedule} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

