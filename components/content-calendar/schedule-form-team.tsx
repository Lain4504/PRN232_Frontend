"use client";

import React, { useState, useMemo } from "react";
import { useScheduleContent } from "@/hooks/use-content-calendar";
import { useTeamBrands } from "@/hooks/use-team-brands";
import { useTeamContents } from "@/hooks/use-team-content";
import { useGetSocialAccounts } from "@/hooks/use-social-accounts";
import { ScheduleFormShared } from "./schedule-form-shared";
import type { ScheduleContentRequest, ContentResponseDto } from "@/lib/types/aisam-types";
import { ContentStatusEnum } from "@/lib/types/aisam-types";
import { toast } from "sonner";

interface TeamScheduleFormProps {
  teamId: string; // Required for team form
  contentId?: string;
  defaultDate?: string;
  defaultTime?: string;
  selectedBrandId?: string;
  onSuccess: () => void;
}

export function TeamScheduleForm({
  teamId,
  contentId: propContentId,
  defaultDate,
  defaultTime,
  selectedBrandId: propSelectedBrandId,
  onSuccess
}: TeamScheduleFormProps) {
  const [selectedBrandId, setSelectedBrandId] = useState(propSelectedBrandId || '');
  const [selectedContentId, setSelectedContentId] = useState(propContentId || '');
  const [selectedIntegrationIds, setSelectedIntegrationIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState(defaultDate || '');
  const [scheduledTime, setScheduledTime] = useState(defaultTime || '');
  const [timezone, setTimezone] = useState('UTC');

  // Only fetch team brands for team context
  const { data: teamBrands = [], isLoading: brandsLoading } = useTeamBrands(teamId);
  
  // Get team contents - filter by selected brand or all team brands
  const { data: teamContents, isLoading: contentsLoading, error: contentsError } = useTeamContents(
    teamId,
    {
      brandId: selectedBrandId || undefined,
      status: ContentStatusEnum.Approved,
      page: 1,
      pageSize: 100
    }
  );

  const { data: socialAccounts } = useGetSocialAccounts();
  const scheduleMutation = useScheduleContent(selectedContentId, selectedBrandId);

  // Transform brands to match expected format
  const brands = useMemo(() => {
    return teamBrands.map((brand: { id: string; name: string }) => ({
      id: brand.id,
      name: brand.name
    }));
  }, [teamBrands]);

  // Transform contents to match expected format
  const contentArray: ContentResponseDto[] | undefined = useMemo(() => {
    if (!teamContents) return undefined;
    const data = Array.isArray(teamContents) ? teamContents : (teamContents as { data?: ContentResponseDto[] }).data;
    return data || [];
  }, [teamContents]);

  const selectedContent = contentArray?.find((c) => c.id === selectedContentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBrandId || !selectedContentId || selectedIntegrationIds.length === 0 || !scheduledDate || !scheduledTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const normalizedTime = scheduledTime && scheduledTime.length === 5 ? `${scheduledTime}:00` : scheduledTime;

    const payload: ScheduleContentRequest = {
      scheduledDate: scheduledDate,
      scheduledTime: normalizedTime,
      timezone,
      integrationIds: selectedIntegrationIds,
    };

    try {
      await scheduleMutation.mutateAsync(payload);
      toast.success('Content scheduled successfully!');
      resetForm();
      onSuccess();
    } catch (error) {
      toast.error('Failed to schedule content');
    }
  };

  const resetForm = () => {
    setSelectedBrandId(propSelectedBrandId || '');
    setSelectedContentId(propContentId || '');
    setSelectedIntegrationIds([]);
    setScheduledDate(defaultDate || '');
    setScheduledTime(defaultTime || '');
    setTimezone('UTC');
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    setSelectedContentId('');
  };

  const handleIntegrationToggle = (integrationId: string) => {
    setSelectedIntegrationIds(prev => 
      prev.includes(integrationId) 
        ? prev.filter(id => id !== integrationId)
        : [...prev, integrationId]
    );
  };

  return (
    <ScheduleFormShared
      selectedBrandId={selectedBrandId}
      selectedContentId={selectedContentId}
      selectedIntegrationIds={selectedIntegrationIds}
      scheduledDate={scheduledDate}
      scheduledTime={scheduledTime}
      timezone={timezone}
      onBrandChange={handleBrandChange}
      onContentChange={setSelectedContentId}
      onIntegrationToggle={handleIntegrationToggle}
      onDateChange={setScheduledDate}
      onTimeChange={setScheduledTime}
      onTimezoneChange={setTimezone}
      onSubmit={handleSubmit}
      brands={brands}
      brandsLoading={brandsLoading}
      contents={contentArray}
      contentsLoading={contentsLoading}
      contentsError={contentsError}
      socialAccounts={socialAccounts}
      isSubmitting={scheduleMutation.isPending}
      contentId={propContentId}
      selectedContent={selectedContent}
    />
  );
}

