"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { ContentsManagement } from "./contents-management";

export function ContentsPage() {
  const searchParams = useSearchParams();
  const brandId = searchParams.get('brandId') || undefined;

  return <ContentsManagement initialBrandId={brandId} />;
}