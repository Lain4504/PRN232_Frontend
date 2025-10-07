"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Plus, 
  Send,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { authApi, calendarApi, contentApi, socialIntegrationApi } from "@/lib/mock-api";
import { User as UserType, CalendarEvent, Content, SocialIntegration } from "@/lib/types/aisam-types";
import { toast } from "sonner";

export function CalendarManagement() {
  const [user, setUser] = useState<UserType | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [socialIntegrations, setSocialIntegrations] = useState<SocialIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    content_id: '',
    social_integration_id: '',
    scheduled_date: '',
    time: '',
    timezone: 'UTC'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        }
        
        // Get calendar events
        const eventsResponse = await calendarApi.getCalendarEvents();
        if (eventsResponse.success) {
          setEvents(eventsResponse.data);
        }
        
        // Get approved contents
        const contentsResponse = await contentApi.getContents({ status: 'approved' });
        if (contentsResponse.success) {
          setContents(contentsResponse.data);
        }
        
        // Get social integrations
        const integrationsResponse = await socialIntegrationApi.getSocialIntegrations();
        if (integrationsResponse.success) {
          setSocialIntegrations(integrationsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load calendar data:', error);
        toast.error('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'scheduled_post':
        return 'bg-chart-1/10 text-chart-1';
      case 'approval_due':
        return 'bg-chart-4/10 text-chart-4';
      case 'campaign_launch':
        return 'bg-chart-2/10 text-chart-2';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleSchedulePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduleForm.content_id || !scheduleForm.social_integration_id || !scheduleForm.scheduled_date || !scheduleForm.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const scheduledDateTime = new Date(`${scheduleForm.scheduled_date}T${scheduleForm.time}`);
      const response = await calendarApi.schedulePost({
        content_id: scheduleForm.content_id,
        social_integration_id: scheduleForm.social_integration_id,
        scheduled_date: scheduledDateTime.toISOString(),
        timezone: scheduleForm.timezone
      });
      
      if (response.success) {
        // Add new event to the calendar
        const content = contents.find(c => c.id === scheduleForm.content_id);
        const newEvent: CalendarEvent = {
          id: `event-${Date.now()}`,
          title: content?.title || 'Scheduled Post',
          date: scheduleForm.scheduled_date,
          time: scheduleForm.time,
          type: 'scheduled_post',
          status: 'pending',
          content_id: scheduleForm.content_id
        };
        
        setEvents([...events, newEvent]);
        setShowScheduleModal(false);
        setScheduleForm({
          content_id: '',
          social_integration_id: '',
          scheduled_date: '',
          time: '',
          timezone: 'UTC'
        });
        toast.success('Post scheduled successfully!');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Failed to schedule post:', error);
      toast.error('Failed to schedule post');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and manage your content publishing
          </p>
        </div>
        <Button onClick={() => setShowScheduleModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Post
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-2 h-20"></div>;
                  }
                  
                  const dayEvents = getEventsForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate?.toDateString() === day.toDateString();
                  
                  return (
                    <div
                      key={day.getDate()}
                      className={`p-2 h-20 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                        isToday ? 'bg-primary/10 border-primary' : ''
                      } ${isSelected ? 'bg-accent border-accent-foreground' : ''}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs px-1 py-0.5 rounded ${getEventBadgeColor(event.type)}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Scheduled Posts</span>
                <Badge variant="secondary">
                  {events.filter(e => e.type === 'scheduled_post').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Approvals</span>
                <Badge variant="outline" className="border-chart-4 text-chart-4">
                  {events.filter(e => e.type === 'approval_due').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Campaigns</span>
                <Badge variant="default" className="bg-chart-2">
                  {events.filter(e => e.type === 'campaign_launch').length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map(event => (
                      <div key={event.id} className="p-2 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${getEventBadgeColor(event.type)}`}>
                            {event.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{event.time}</span>
                        </div>
                        <p className="text-sm font-medium">{event.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Schedule Post</CardTitle>
              <CardDescription>
                Schedule an approved content for publishing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSchedulePost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <select
                    id="content"
                    value={scheduleForm.content_id}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, content_id: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select content</option>
                    {contents.map(content => (
                      <option key={content.id} value={content.id}>
                        {content.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <select
                    id="platform"
                    value={scheduleForm.social_integration_id}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, social_integration_id: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select platform</option>
                    {socialIntegrations.map(integration => (
                      <option key={integration.id} value={integration.id}>
                        {integration.platform}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={scheduleForm.scheduled_date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowScheduleModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
