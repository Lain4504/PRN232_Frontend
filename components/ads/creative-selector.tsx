"use client";

import React from "react";
import { useCreatives } from "@/hooks/use-creatives";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface CreativeSelectorProps {
  adSetId: string;
  value?: string;
  onChange?: (creativeId: string) => void;
}

export function CreativeSelector({ adSetId, value, onChange }: CreativeSelectorProps) {
  const { data, isLoading } = useCreatives({ adSetId, page: 1, pageSize: 100 });
  const creatives = data?.data || [];

  return (
    <Select value={value} onValueChange={(v) => onChange?.(v)} disabled={isLoading}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Loading creatives..." : "Select a creative"} />
      </SelectTrigger>
      <SelectContent>
        {creatives.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


