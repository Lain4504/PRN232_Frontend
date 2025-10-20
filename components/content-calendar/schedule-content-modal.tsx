"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Send } from "lucide-react";
import { useScheduleContent } from "@/hooks/use-content-calendar";
import { useContents } from "@/hooks/use-contents";
import { useGetSocialAccounts } from "@/hooks/use-social-accounts";
import type { ScheduleContentRequest } from "@/lib/types/aisam-types";
import { ContentStatusEnum } from "@/lib/types/aisam-types";
import { toast } from "sonner";

interface ScheduleContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId?: string;
  defaultDate?: string;
  defaultTime?: string;
}

export function ScheduleContentModal({ 
  isOpen, 
  onClose, 
  contentId: propContentId,
  defaultDate,
  defaultTime 
}: ScheduleContentModalProps) {
  const [selectedContentId, setSelectedContentId] = useState(propContentId || '');
  const [selectedIntegrationIds, setSelectedIntegrationIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState(defaultDate || '');
  const [scheduledTime, setScheduledTime] = useState(defaultTime || '');
  const [timezone, setTimezone] = useState('UTC');

  const { data: contents } = useContents({ status: ContentStatusEnum.Approved });
  const { data: socialAccounts } = useGetSocialAccounts();
  const scheduleMutation = useScheduleContent(selectedContentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContentId || selectedIntegrationIds.length === 0 || !scheduledDate || !scheduledTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload: ScheduleContentRequest = {
      scheduledDate: `${scheduledDate}T${scheduledTime}`,
      timezone,
      integrationIds: selectedIntegrationIds,
    };

    try {
      await scheduleMutation.mutateAsync(payload);
      toast.success('Content scheduled successfully!');
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Failed to schedule content');
    }
  };

  const resetForm = () => {
    setSelectedContentId('');
    setSelectedIntegrationIds([]);
    setScheduledDate('');
    setScheduledTime('');
    setTimezone('UTC');
  };

  const handleIntegrationToggle = (integrationId: string) => {
    setSelectedIntegrationIds(prev => 
      prev.includes(integrationId) 
        ? prev.filter(id => id !== integrationId)
        : [...prev, integrationId]
    );
  };

  const availableIntegrations = socialAccounts?.flatMap(account => 
    account.targets?.map(target => ({
      id: target.id,
      name: target.name,
      platform: account.provider,
      type: target.type
    })) || []
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Content
          </DialogTitle>
          <DialogDescription>
            Schedule approved content for publishing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content Selection */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Select 
              value={selectedContentId} 
              onValueChange={setSelectedContentId}
              disabled={!!propContentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content" />
              </SelectTrigger>
              <SelectContent>
                {contents?.data?.map(content => (
                  <SelectItem key={content.id} value={content.id}>
                    {content.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableIntegrations.map(integration => (
                <div key={integration.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={integration.id}
                    checked={selectedIntegrationIds.includes(integration.id)}
                    onChange={() => handleIntegrationToggle(integration.id)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={integration.id} className="text-sm">
                    {integration.name} ({integration.platform})
                  </Label>
                </div>
              ))}
            </div>
            {availableIntegrations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No social accounts available. Please connect social accounts first.
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={scheduleMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
