"use client";

import React from "react";
import { ContentsManagement } from "@/components/pages/contents/contents-management";

interface BrandContentViewerProps {
  brandId: string;
  brandName?: string;
}

export function BrandContentViewer({ brandId, brandName }: BrandContentViewerProps) {
  return (
    <div className="space-y-4">
      {brandName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900">
            Content for: {brandName}
          </h2>
          <p className="text-sm text-blue-700">
            Showing content filtered by brand ID: {brandId}
          </p>
        </div>
      )}
      <ContentsManagement initialBrandId={brandId} />
    </div>
  );
}