"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { socialAccountApi, calendarApi } from "@/lib/mock-api";
import { SocialAccount, SocialIntegration, Content } from "@/lib/types/aisam-types";
import { toast } from "sonner";

interface ContentPublisherProps {
  content: Content;
  onPublish?: (contentId: string, publishedTo: string[]) => void;
  onSchedule?: (contentId: string, scheduledDate: string, platforms: string[]) => void;
}

interface PublishTarget {
  id: string;
  platform: string;
  account_name: string;
  account_id: string;
  selected: boolean;
}

interface ScheduleForm {
  date: string;
  time: string;
  timezone: string;
  notes?: string;
}

export function ContentPublisher({ content, onPublish, onSchedule }: ContentPublisherProps) {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [publishTargets, setPublishTargets] = useState<PublishTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    date: '',
    time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notes: '',
  });

  useEffect(() => {
    const loadSocialAccounts = async () => {
      try {
        setLoading(true);
        // Get current user ID (mock for now)
        const userId = 'user-1';

        const response = await socialAccountApi.getSocialAccounts(userId);
        if (response.success) {
          setSocialAccounts(response.data);

          // Convert to publish targets
          const targets: PublishTarget[] = response.data
            .filter(account => account.status === 'active')
            .map(account => ({
              id: account.id,
              platform: account.platform,
              account_name: account.account_name,
              account_id: account.account_id,
              selected: false,
            }));

          setPublishTargets(targets);
        }
      } catch (error) {
        console.error('Failed to load social accounts:', error);
        toast.error('Failed to load social accounts');
      } finally {
        setLoading(false);
      }
    };

    loadSocialAccounts();
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'twitter':
        return <Twitter className="h-4 w-4 text-blue-400" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4 text-blue-700" />;
      case 'tiktok':
        return <Youtube className="h-4 w-4 text-black" />; // Using YouTube icon as placeholder
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'instagram':
        return 'bg-pink-50 border-pink-200 text-pink-700';
      case 'twitter':
        return 'bg-blue-50 border-blue-200 text-blue-400';
      case 'linkedin':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'tiktok':
        return 'bg-gray-50 border-gray-200 text-gray-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const handleTargetToggle = (targetId: string) => {
    setPublishTargets(prev =>
      prev.map(target =>
        target.id === targetId
          ? { ...target, selected: !target.selected }
          : target
      )
    );
  };

  const handleSelectAll = (platform?: string) => {
    setPublishTargets(prev =>
      prev.map(target => ({
        ...target,
        selected: platform ? (target.platform === platform ? true : target.selected) : true
      }))
    );
  };

  const handleDeselectAll = () => {
    setPublishTargets(prev =>
      prev.map(target => ({ ...target, selected: false }))
    );
  };

  const selectedTargets = publishTargets.filter(target => target.selected);
  const selectedPlatforms = [...new Set(selectedTargets.map(target => target.platform))];

  const handlePublishNow = async () => {
    if (selectedTargets.length === 0) {
      toast.error('Please select at least one platform to publish to');
      return;
    }

    try {
      setPublishing(true);

      // Simulate publishing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock publishing to each selected platform
      for (const target of selectedTargets) {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Publishing to ${target.platform}: ${target.account_name}`);
      }

      toast.success(`Content published successfully to ${selectedTargets.length} platform${selectedTargets.length > 1 ? 's' : ''}!`);

      onPublish?.(content.id, selectedTargets.map(t => t.platform));
    } catch (error) {
      console.error('Failed to publish content:', error);
      toast.error('Failed to publish content');
    } finally {
      setPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (selectedTargets.length === 0) {
      toast.error('Please select at least one platform to schedule for');
      return;
    }

    if (!scheduleForm.date || !scheduleForm.time) {
      toast.error('Please select a date and time for scheduling');
      return;
    }

    try {
      setPublishing(true);

      // Combine date and time
      const scheduledDateTime = new Date(`${scheduleForm.date}T${scheduleForm.time}`);

      if (scheduledDateTime <= new Date()) {
        toast.error('Scheduled time must be in the future');
        return;
      }

      // Create scheduled post
      const response = await calendarApi.schedulePost({
        content_id: content.id,
        social_integration_id: selectedTargets[0].id, // Use first target as primary
        scheduled_date: scheduledDateTime.toISOString(),
        timezone: scheduleForm.timezone,
      });

      if (response.success) {
        toast.success('Content scheduled successfully!');
        onSchedule?.(content.id, scheduledDateTime.toISOString(), selectedTargets.map(t => t.platform));
        setShowScheduleDialog(false);
      } else {
        toast.error('Failed to schedule content');
      }
    } catch (error) {
      console.error('Failed to schedule content:', error);
      toast.error('Failed to schedule content');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading publishing options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Content Preview</CardTitle>
          <CardDescription>
            Review your content before publishing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold mb-2">{content.title}</h4>
            {content.text_content && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {content.text_content}
              </p>
            )}
            {content.image_url && (
              <img
                src={content.image_url}
                alt="Content"
                className="w-full max-w-sm h-auto rounded-lg mb-3"
              />
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Badge variant="outline">{content.ad_type.replace('_', ' ')}</Badge>
              <Badge variant="secondary">{content.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Platforms</CardTitle>
              <CardDescription>
                Choose where you want to publish this content
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSelectAll()}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedPlatforms.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedPlatforms.map(platform => (
                <Button
                  key={platform}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(platform)}
                  className="text-xs"
                >
                  Select all {platform}
                </Button>
              ))}
            </div>
          )}

          <div className="grid gap-3">
            {publishTargets.map((target) => (
              <div
                key={target.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  target.selected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  id={target.id}
                  checked={target.selected}
                  onCheckedChange={() => handleTargetToggle(target.id)}
                />
                <div className="flex items-center gap-3 flex-1">
                  {getPlatformIcon(target.platform)}
                  <div className="flex-1">
                    <Label htmlFor={target.id} className="font-medium cursor-pointer">
                      {target.account_name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {target.platform.charAt(0).toUpperCase() + target.platform.slice(1)}
                    </p>
                  </div>
                  <Badge variant="outline" className={getPlatformColor(target.platform)}>
                    {target.platform}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {publishTargets.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No social accounts connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect your social media accounts to start publishing content.
              </p>
              <Button asChild>
                <a href="/dashboard/social-accounts">Connect Accounts</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish Actions */}
      {selectedTargets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Publish Options</CardTitle>
            <CardDescription>
              Choose how and when to publish your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{selectedTargets.length} platform{selectedTargets.length > 1 ? 's' : ''} selected</span>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button
                onClick={handlePublishNow}
                disabled={publishing}
                className="flex-1"
                size="lg"
              >
                {publishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publish Now
                  </>
                )}
              </Button>

              <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="flex-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Schedule Content</DialogTitle>
                    <DialogDescription>
                      Choose when to publish this content
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={scheduleForm.date}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={scheduleForm.time}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={scheduleForm.timezone} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, timezone: value }))}>
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
                          <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                          <SelectItem value="Asia/Saigon">Asia/Saigon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes for this scheduled post..."
                        value={scheduleForm.notes}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setShowScheduleDialog(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleSchedule} disabled={publishing} className="flex-1">
                        {publishing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            Schedule Post
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}