"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdPerformanceDashboardProps {
  impressions?: number;
  clicks?: number;
  ctr?: number;
  spend?: number;
}

export function AdPerformanceDashboard({ impressions, clicks, ctr, spend }: AdPerformanceDashboardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Impressions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{impressions ?? '-'}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clicks ?? '-'}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">CTR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ctr != null ? `${ctr.toFixed(2)}%` : '-'}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{spend != null ? `$${spend.toLocaleString()}` : '-'}</div>
        </CardContent>
      </Card>
    </div>
  );
}


