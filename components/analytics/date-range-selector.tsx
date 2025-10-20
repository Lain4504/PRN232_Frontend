"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TimeRange } from '@/lib/types/analytics';
import { DEFAULT_TIME_RANGES } from '@/lib/constants/analytics-metrics';

interface DateRangeSelectorProps {
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
  className?: string;
}

export function DateRangeSelector({ 
  timeRange, 
  onTimeRangeChange, 
  className 
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('custom');
  const [startDate, setStartDate] = useState<Date | undefined>(
    timeRange.start ? new Date(timeRange.start) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    timeRange.end ? new Date(timeRange.end) : undefined
  );

  // Handle period selection
  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    
    if (period === 'custom') {
      setIsOpen(true);
      return;
    }

    const periodConfig = Object.values(DEFAULT_TIME_RANGES).find(p => p.value === period);
    if (periodConfig) {
      const now = new Date();
      const start = new Date();
      
      switch (period) {
        case '7d':
          start.setDate(now.getDate() - 7);
          break;
        case '30d':
          start.setDate(now.getDate() - 30);
          break;
        case '90d':
          start.setDate(now.getDate() - 90);
          break;
        case '6m':
          start.setMonth(now.getMonth() - 6);
          break;
        case '1y':
          start.setFullYear(now.getFullYear() - 1);
          break;
        case 'this_month':
          start.setDate(1);
          break;
        case 'last_month':
          start.setMonth(now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          onTimeRangeChange({
            start: start.toISOString(),
            end: lastMonthEnd.toISOString(),
            period: 'month'
          });
          return;
      }
      
      onTimeRangeChange({
        start: start.toISOString(),
        end: now.toISOString(),
        period: period.includes('d') ? 'day' : period.includes('m') ? 'month' : 'year'
      });
    }
  };

  // Handle custom date range selection
  const handleCustomDateRange = () => {
    if (startDate && endDate) {
      onTimeRangeChange({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        period: 'day'
      });
      setIsOpen(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(date);
      if (date && endDate && date > endDate) {
        setEndDate(undefined);
      }
    } else {
      setEndDate(date);
      if (date && startDate && date < startDate) {
        setStartDate(undefined);
      }
    }
  };

  // Get current period label
  const getCurrentPeriodLabel = () => {
    if (selectedPeriod === 'custom') {
      if (startDate && endDate) {
        return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
      }
      return 'Custom range';
    }
    
    const periodConfig = Object.values(DEFAULT_TIME_RANGES).find(p => p.value === selectedPeriod);
    return periodConfig?.label || 'Select period';
  };

  // Calculate days difference
  const getDaysDifference = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Date Range
        </CardTitle>
        <CardDescription className="text-xs">
          Select the time period for your analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Period Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Quick Select</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DEFAULT_TIME_RANGES).slice(0, 6).map(([key, period]) => (
              <Button
                key={key}
                variant={selectedPeriod === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => handlePeriodSelect(period.value)}
                className="text-xs h-8"
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Custom Range</Label>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getCurrentPeriodLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start Date</Label>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => handleDateSelect(date, 'start')}
                    disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                    initialFocus
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">End Date</Label>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => handleDateSelect(date, 'end')}
                    disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                  />
                </div>

                {startDate && endDate && (
                  <div className="text-xs text-muted-foreground">
                    {getDaysDifference()} days selected
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleCustomDateRange}
                    disabled={!startDate || !endDate}
                    size="sm"
                    className="flex-1"
                  >
                    Apply Range
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Period Type Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Aggregation Period</Label>
          <Select
            value={timeRange.period}
            onValueChange={(value) => onTimeRangeChange({
              ...timeRange,
              period: value as 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
            })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Hour</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current Selection Summary */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>From: {timeRange.start ? format(new Date(timeRange.start), 'MMM dd, yyyy') : 'Not set'}</div>
            <div>To: {timeRange.end ? format(new Date(timeRange.end), 'MMM dd, yyyy') : 'Not set'}</div>
            <div>Period: {timeRange.period}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
