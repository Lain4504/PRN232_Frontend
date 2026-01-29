"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { ContentStatusEnum } from "@/lib/types/omniadly-types";

interface ApprovalFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ContentStatusEnum | "all";
  onStatusChange: (status: ContentStatusEnum | "all") => void;
  totalCount: number;
}

export function ApprovalFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  totalCount
}: ApprovalFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-8">
      <div className="relative flex-1 group w-full lg:max-w-[450px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
        <Input
          placeholder="TÌM KIẾM CHIẾN DỊCH, THƯƠNG HIỆU..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-14 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm focus-visible:ring-slate-100 dark:focus-visible:ring-slate-800 font-medium transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <Badge variant="outline" className="border-none text-slate-400 dark:text-slate-500 font-black text-[9px] uppercase tracking-widest px-3">Lọc trạng thái</Badge>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as ContentStatusEnum | "all")}
            className="h-10 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-none font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-white outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            <option value="all">TẤT CẢ</option>
            <option value={ContentStatusEnum.PendingApproval}>CHỜ DUYỆT</option>
            <option value={ContentStatusEnum.Approved}>ĐÃ DUYỆT</option>
            <option value={ContentStatusEnum.Rejected}>TỪ CHỐI</option>
            <option value={ContentStatusEnum.Draft}>NHÁP</option>
            <option value={ContentStatusEnum.Published}>ĐÃ ĐĂNG</option>
          </select>
        </div>
        <div className="h-14 px-6 flex items-center bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-slate-100 dark:border-slate-800">
          <Badge variant="secondary" className="bg-slate-900 dark:bg-primary text-white font-black text-[10px] px-3 py-1 rounded-lg mr-3 shadow-lg shadow-slate-200 dark:shadow-primary/20">
            {totalCount}
          </Badge>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hồ sơ</span>
        </div>
      </div>
    </div>
  );
}
