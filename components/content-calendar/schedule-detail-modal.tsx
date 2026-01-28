"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGetSocialAccounts } from "@/hooks/use-social-accounts";
import type { ContentCalendar } from "@/lib/types/omniadly-types";
import {
  Calendar,
  Clock,
  Building2,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface ScheduleDetailModalProps {
  schedule: ContentCalendar | null;
  isOpen: boolean;
  onClose: () => void;
}

function ScheduleDetailContent({ schedule }: { schedule: ContentCalendar | null }) {
  const { data: socialAccounts } = useGetSocialAccounts();

  if (!schedule) return null;

  const platforms = schedule.integrationIds?.map(integrationId => {
    const target = socialAccounts?.flatMap(account =>
      account.targets?.filter(t => t.id === integrationId) || []
    )?.[0];
    return target || null;
  }).filter((t): t is NonNullable<typeof t> => !!t) || [];

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' };
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { date: 'Ngày không hợp lệ', time: '' };

      return {
        date: date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        }),
        time: date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      };
    } catch (e) {
      return { date: 'Lỗi định dạng', time: '' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50">Đã đăng</Badge>;
      case 'failed':
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50">Thất bại</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Đã hủy</Badge>;
      default:
        return <Badge className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50">Đang chờ</Badge>;
    }
  };

  const { date, time } = formatDate(schedule.scheduledDate);

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-lg border bg-slate-50/50 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {schedule.contentTitle || 'Nội dung không tên'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Building2 className="size-3.5" />
              <span>{schedule.brandName || 'Thương hiệu chưa xác định'}</span>
            </div>
          </div>
          {getStatusBadge(schedule.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Clock className="size-3.5" />
            <span>Thời điểm đăng bài</span>
          </div>
          <div className="p-4 rounded-lg border bg-white space-y-1">
            <p className="text-sm font-semibold text-slate-900">{date}</p>
            <p className="text-xs text-slate-500">{time} {schedule.timezone && `(${schedule.timezone})`}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Globe className="size-3.5" />
            <span>Kênh đăng bài ({platforms.length})</span>
          </div>
          <div className="space-y-2">
            {platforms.map((target) => (
              <div key={target.id} className="flex items-center gap-3 p-3 rounded-lg border bg-white">
                <Avatar className="size-8 rounded border">
                  <AvatarImage src={target.profilePictureUrl} />
                  <AvatarFallback className="bg-slate-100 text-slate-500 text-[10px]">{target.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{target.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{target.provider}</p>
                </div>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
            ))}
            {platforms.length === 0 && (
              <p className="text-xs text-slate-400 italic">Không có dữ liệu kênh đăng bài.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScheduleDetailModal({ schedule, isOpen, onClose }: ScheduleDetailModalProps) {
  const isMobile = useIsMobile();
  const title = "Chi tiết lịch đăng";
  const description = "Thông tin chi tiết về thời gian và trạng thái của bài viết.";

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto flex-1">
            <ScheduleDetailContent schedule={schedule} />
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
          <ScheduleDetailContent schedule={schedule} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
