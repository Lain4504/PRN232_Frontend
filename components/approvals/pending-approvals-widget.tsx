"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, AlertCircle } from "lucide-react";
import { usePendingApprovals } from "@/hooks/use-approvals";
import { ContentStatusEnum } from "@/lib/types/omniadly-types";
import Link from "next/link";

interface PendingApprovalsWidgetProps {
  limit?: number;
  showViewAll?: boolean;
}

export function PendingApprovalsWidget({
  limit = 5,
  showViewAll = true
}: PendingApprovalsWidgetProps) {
  const { data: pendingApprovalsData, isLoading } = usePendingApprovals(1, limit);
  const approvals = pendingApprovalsData?.data || [];

  if (isLoading) {
    return (
      <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm animate-pulse">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-3 text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
            <div className="size-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-500/40" />
            </div>
            Hàng chờ duyệt
          </CardTitle>
          <CardDescription className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Đang đồng bộ dữ liệu...</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl w-full" />
            <div className="h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-black/20 overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              Hàng chờ duyệt
            </CardTitle>
            <CardDescription className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 ml-13">Nội dung chiến lược cần phê duyệt</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-slate-900 dark:bg-primary text-white dark:text-white border-none font-black text-[11px] px-3 py-1 rounded-xl">
            {approvals.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approvals.map((approval) => (
              <div key={approval.id} className="group flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate leading-tight">
                    {approval.contentTitle || 'Nhiệm vụ không tên'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {approval.brandName || 'Thương hiệu N/A'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {new Date(approval.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="size-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-all" asChild>
                  <Link href={`/dashboard/approvals?id=${approval.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}

        {showViewAll && approvals.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] bg-slate-50 dark:bg-slate-800 border-none text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all" asChild>
              <Link href="/dashboard/approvals">
                Truy cập trung tâm phê duyệt
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
