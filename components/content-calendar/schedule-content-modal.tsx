"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Send, Loader2 } from "lucide-react";
import { useScheduleContent } from "@/hooks/use-content-calendar";
import { useContentsByBrand } from "@/hooks/use-contents";
import { useBrands } from "@/hooks/use-brands";
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
  teamId?: string;
  selectedBrandId?: string;
}

export function ScheduleContentModal({ 
  isOpen, 
  onClose, 
  contentId: propContentId,
  defaultDate,
  defaultTime,
  teamId,
  selectedBrandId
}: ScheduleContentModalProps) {
  const [selectedBrandIdState, setSelectedBrandIdState] = useState(selectedBrandId || '');
  const [selectedContentId, setSelectedContentId] = useState(propContentId || '');
  const [selectedIntegrationIds, setSelectedIntegrationIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState(defaultDate || '');
  const [scheduledTime, setScheduledTime] = useState(defaultTime || '');
  const [timezone, setTimezone] = useState('UTC');

  // Fetch brands first
  const { data: brands, isLoading: brandsLoading } = useBrands();
  
  // Fetch contents by selected brand
  const { data: contents, isLoading: contentsLoading, error: contentsError } = useContentsByBrand(
    selectedBrandIdState, 
    { status: ContentStatusEnum.Approved }
  );

  // Debug log to see the actual data structure
  console.log('Contents data:', contents);
  console.log('Selected brand ID:', selectedBrandIdState);
  console.log('Contents loading:', contentsLoading);
  console.log('Contents data array:', Array.isArray(contents) ? contents : contents?.data);

  
  const { data: socialAccounts } = useGetSocialAccounts();
  const scheduleMutation = useScheduleContent(selectedContentId, selectedBrandIdState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBrandIdState || !selectedContentId || selectedIntegrationIds.length === 0 || !scheduledDate || !scheduledTime) {
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
    setSelectedBrandIdState('');
    setSelectedContentId('');
    setSelectedIntegrationIds([]);
    setScheduledDate('');
    setScheduledTime('');
    setTimezone('UTC');
  };

  // Handle brand selection - reset content selection when brand changes
  const handleBrandChange = (brandId: string) => {
    setSelectedBrandIdState(brandId);
    setSelectedContentId(''); // Reset content selection when brand changes
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
          {/* Brand Selection */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Select 
              value={selectedBrandIdState} 
              onValueChange={handleBrandChange}
              disabled={brandsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={brandsLoading ? "Loading brands..." : "Select brand"} />
              </SelectTrigger>
              <SelectContent>
                {brands?.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {brandsLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading brands...
              </div>
            )}
          </div>

          {/* Content Selection */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Select 
              value={selectedContentId} 
              onValueChange={setSelectedContentId}
              disabled={!!propContentId || !selectedBrandIdState || contentsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedBrandIdState 
                    ? "Please select a brand first" 
                    : contentsLoading 
                      ? "Loading content..." 
                      : "Select content"
                } />
              </SelectTrigger>
               <SelectContent>
                 {(() => {
                   const contentArray = Array.isArray(contents) ? contents : contents?.data;
                   return contentArray?.map((content: any) => (
                     <SelectItem key={content.id} value={content.id}>
                       <div className="flex flex-col">
                         <span className="font-medium">{content.title}</span>
                         <span className="text-xs text-muted-foreground">
                           {content.adType} • {content.status}
                         </span>
                       </div>
                     </SelectItem>
                   ));
                 })()}
               </SelectContent>
            </Select>
            {contentsLoading && selectedBrandIdState && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading content...
              </div>
            )}
             {selectedBrandIdState && (() => {
               const contentArray = Array.isArray(contents) ? contents : contents?.data;
               return contentArray?.length === 0 && !contentsLoading;
             })() && (
               <p className="text-sm text-muted-foreground">
                 No approved content available for this brand.
               </p>
             )}
             {selectedBrandIdState && (() => {
               const contentArray = Array.isArray(contents) ? contents : contents?.data;
               return contentArray && contentArray.length > 0;
             })() && (
               <p className="text-sm text-green-600">
                 Found {(Array.isArray(contents) ? contents : contents?.data)?.length} content(s) for this brand.
               </p>
             )}
             {contentsError && (
               <p className="text-sm text-red-600">
                 Error loading content: {contentsError.message || 'Unknown error'}
               </p>
             )}
             {selectedContentId && (Array.isArray(contents) ? contents : contents?.data) && (
               <div className="mt-2 p-3 bg-muted rounded-lg">
                 {(() => {
                   const contentArray = Array.isArray(contents) ? contents : contents?.data;
                   const selectedContent = contentArray?.find((c: any) => c.id === selectedContentId);
                   return selectedContent ? (
                     <div className="space-y-1">
                       <p className="text-sm font-medium">{selectedContent.title}</p>
                       <p className="text-xs text-muted-foreground">
                         Type: {selectedContent.adType} • Status: {selectedContent.status}
                       </p>
                       {selectedContent.textContent && (
                         <p className="text-xs text-muted-foreground line-clamp-2">
                           {selectedContent.textContent}
                         </p>
                       )}
                     </div>
                   ) : null;
                 })()}
               </div>
             )}
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
