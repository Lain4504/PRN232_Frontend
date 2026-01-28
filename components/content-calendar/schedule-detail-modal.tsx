"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  X,
  Smartphone,
  CheckCircle2,
  Info
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Đã phát hành</Badge>;
      case 'failed':
        return <Badge className="bg-rose-100 text-rose-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Thất bại</Badge>;
      case 'cancelled':
        return <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Đã hủy</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Đang chờ</Badge>;
    }
  };

  const { date, time } = formatDate(schedule.scheduledDate);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Content Identity */}
      <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thực thể Nội dung</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight line-clamp-2">
              {schedule.contentTitle || 'Nội dung không tên'}
            </h3>
          </div>
          {getStatusBadge(schedule.status)}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{schedule.brandName || 'Thương hiệu'}</span>
          </div>
        </div>
      </div>

      {/* Deployment Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-slate-400" />
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thời điểm Phân phối</Label>
          </div>
          <div className="p-6 rounded-2xl border-2 border-slate-100 bg-white shadow-sm space-y-1">
            <p className="text-base font-black text-slate-900 uppercase tracking-tight">{date}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{time} ({schedule.timezone})</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-slate-400" />
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kênh truyền thông ({platforms.length})</Label>
          </div>
          <div className="space-y-3">
            {platforms.map((target) => (
              <div key={target.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <Avatar className="size-10 rounded-xl border-2 border-white shadow-sm">
                  <AvatarImage src={target.profilePictureUrl} />
                  <AvatarFallback className="bg-slate-900 text-white font-black text-xs">{target.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">{target.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{target.provider}</p>
                </div>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
            ))}
            {platforms.length === 0 && (
              <div className="p-4 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-3">
                <Info className="size-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Không có dữ liệu kênh</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScheduleDetailModal({ schedule, isOpen, onClose }: ScheduleDetailModalProps) {
  const isMobile = useIsMobile();
  const title = "Chi tiết Lịch trình";
  const description = "Thông tin thực thi và trạng thái phân phối của nội dung đã lập lịch.";

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[95vh] flex flex-col rounded-t-[3rem] border-none shadow-2xl bg-white">
          <DrawerHeader className="flex-shrink-0 text-left p-10 pb-4">
            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6 border border-slate-200">
              <Smartphone className="size-6" />
            </div>
            <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">{title}</DrawerTitle>
            <DrawerDescription className="text-sm font-medium text-slate-400 mt-2 italic">{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-10 overflow-y-auto flex-1 pb-10 scrollbar-hide">
            <ScheduleDetailContent schedule={schedule} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border-none p-0 shadow-2xl bg-white focus:outline-none">
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
          <ScheduleDetailContent schedule={schedule} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
