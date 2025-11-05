"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock, 
  Send, 
  Loader2, 
  Target, 
  FileText, 
  Globe, 
  CheckCircle2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import type { ScheduleContentRequest, ContentResponseDto, Brand, SocialAccountDto } from "@/lib/types/aisam-types";
import { toast } from "sonner";

interface ScheduleFormSharedProps {
  // Form state
  selectedBrandId: string;
  selectedContentId: string;
  selectedIntegrationIds: string[];
  scheduledDate: string;
  scheduledTime: string;
  timezone: string;
  
  // Handlers
  onBrandChange: (brandId: string) => void;
  onContentChange: (contentId: string) => void;
  onIntegrationToggle: (integrationId: string) => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onTimezoneChange: (timezone: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  
  // Data
  brands: Brand[];
  brandsLoading: boolean;
  contents: ContentResponseDto[] | undefined;
  contentsLoading: boolean;
  contentsError: Error | null;
  socialAccounts: SocialAccountDto[] | undefined;
  
  // UI state
  isSubmitting: boolean;
  contentId?: string; // Pre-selected content ID
  selectedContent?: ContentResponseDto;
}

export function ScheduleFormShared({
  selectedBrandId,
  selectedContentId,
  selectedIntegrationIds,
  scheduledDate,
  scheduledTime,
  timezone,
  onBrandChange,
  onContentChange,
  onIntegrationToggle,
  onDateChange,
  onTimeChange,
  onTimezoneChange,
  onSubmit,
  brands,
  brandsLoading,
  contents,
  contentsLoading,
  contentsError,
  socialAccounts,
  isSubmitting,
  contentId: propContentId,
  selectedContent
}: ScheduleFormSharedProps) {
  const availableIntegrations = socialAccounts?.flatMap(account => 
    account.targets?.map(target => ({
      id: target.id,
      name: target.name,
      platform: account.provider,
      type: target.type,
      category: target.category,
      profilePictureUrl: target.profilePictureUrl
    })) || []
  ) || [];

  const contentArray: ContentResponseDto[] | undefined = Array.isArray(contents) ? contents : contents;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Brand Selection */}
      <div className="space-y-2">
        <Label htmlFor="brand" className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          Brand
        </Label>
        <Select 
          value={selectedBrandId} 
          onValueChange={onBrandChange}
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
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading brands...</span>
          </div>
        )}
      </div>

      {/* Content Selection */}
      <div className="space-y-2">
        <Label htmlFor="content" className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Content
        </Label>
        <Select 
          value={selectedContentId} 
          onValueChange={onContentChange}
          disabled={!!propContentId || !selectedBrandId || contentsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !selectedBrandId 
                ? "Please select a brand first" 
                : contentsLoading 
                  ? "Loading content..." 
                  : "Select content"
            } />
          </SelectTrigger>
          <SelectContent>
            {contentArray?.map((content) => (
              <SelectItem key={content.id} value={content.id}>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm">{content.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {content.adType}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {content.status}
                    </Badge>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {contentsLoading && selectedBrandId && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading content...</span>
          </div>
        )}
        
        {selectedBrandId && contentArray?.length === 0 && !contentsLoading && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-dashed">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No approved content available for this brand.
            </p>
          </div>
        )}
        
        {selectedBrandId && contentArray && contentArray.length > 0 && !contentsLoading && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm text-muted-foreground">
              Found {contentArray.length} approved content item(s)
            </p>
          </div>
        )}
        
        {contentsError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
            <XCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              Error loading content: {contentsError.message || 'Unknown error'}
            </p>
          </div>
        )}
        
        {selectedContent && (
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm line-clamp-2">
                  {selectedContent.title}
                </h4>
                <Badge variant="secondary" className="shrink-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {selectedContent.adType}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedContent.status}
                </Badge>
              </div>
              {selectedContent.textContent && (
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {selectedContent.textContent}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Platform Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Platforms
        </Label>
        {availableIntegrations.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-muted/20">
            {availableIntegrations.map(integration => {
              const isSelected = selectedIntegrationIds.includes(integration.id);
              return (
                <div
                  key={integration.id}
                  className={`
                    flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors
                    ${isSelected 
                      ? 'bg-background border-border' 
                      : 'bg-muted/30 border-border hover:bg-muted/50'
                    }
                  `}
                  onClick={() => onIntegrationToggle(integration.id)}
                >
                  <input
                    type="checkbox"
                    id={integration.id}
                    checked={isSelected}
                    onChange={() => onIntegrationToggle(integration.id)}
                    className="sr-only"
                  />
                  <label
                    htmlFor={integration.id}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <div className={`
                      flex items-center justify-center w-5 h-5 rounded border-2 transition-colors shrink-0
                      ${isSelected 
                        ? 'bg-primary border-primary' 
                        : 'bg-background border-muted-foreground/30'
                      }
                    `}>
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                      )}
                    </div>
                    {integration.profilePictureUrl && (
                      <Avatar className="h-8 w-8 ring-1 ring-muted flex-shrink-0">
                        <AvatarImage src={integration.profilePictureUrl} alt={integration.name} />
                        <AvatarFallback className="text-xs font-semibold">
                          {integration.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
                        <span className="truncate">{integration.name}</span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0 shrink-0">
                          {integration.platform}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {integration.type && (
                          <p className="text-xs text-muted-foreground truncate">
                            {integration.type}
                          </p>
                        )}
                        {integration.category && (
                          <>
                            {integration.type && <span className="text-xs text-muted-foreground">•</span>}
                            <p className="text-xs text-muted-foreground truncate">
                              {integration.category}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border border-dashed">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No social accounts available. Please connect social accounts first.
            </p>
          </div>
        )}
        {selectedIntegrationIds.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm text-muted-foreground">
              {selectedIntegrationIds.length} platform{selectedIntegrationIds.length > 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </div>

      {/* Date and Time */}
      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Schedule Date & Time
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs text-muted-foreground">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={scheduledDate}
              onChange={(e) => onDateChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="text-xs text-muted-foreground">
              Time
            </Label>
            <Input
              id="time"
              type="time"
              value={scheduledTime}
              onChange={(e) => onTimeChange(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-xs text-muted-foreground">
            Timezone
          </Label>
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              <SelectItem value="Europe/London">London (GMT)</SelectItem>
              <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Schedule Content
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

