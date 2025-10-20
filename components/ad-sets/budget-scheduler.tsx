import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import type { AdSetSchedule } from "@/lib/types/ad-sets";

interface BudgetSchedulerProps {
  budget: number;
  schedule?: AdSetSchedule;
  className?: string;
}

export function BudgetScheduler({ budget, schedule, className }: BudgetSchedulerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Budget & Schedule
        </CardTitle>
        <CardDescription>
          Budget allocation and scheduling information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">Daily Budget</label>
          <p className="text-2xl font-bold">${budget.toLocaleString()}</p>
        </div>

        {/* Schedule */}
        {schedule && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Schedule</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="text-sm">
                  {schedule.startDate 
                    ? format(new Date(schedule.startDate), 'PPP')
                    : 'Not set'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <p className="text-sm">
                  {schedule.endDate 
                    ? format(new Date(schedule.endDate), 'PPP')
                    : 'No end date'
                  }
                </p>
              </div>
            </div>

            {schedule.timezone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                <p className="text-sm">{schedule.timezone}</p>
              </div>
            )}
          </div>
        )}

        {/* Budget Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Budget Summary</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            This ad set will spend up to ${budget.toLocaleString()} per day
            {schedule?.startDate && ` starting ${format(new Date(schedule.startDate), 'MMM dd, yyyy')}`}
            {schedule?.endDate && ` until ${format(new Date(schedule.endDate), 'MMM dd, yyyy')}`}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
