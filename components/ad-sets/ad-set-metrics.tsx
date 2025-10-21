import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MousePointer, TrendingUp, DollarSign } from "lucide-react";
import type { AdSetMetrics } from "@/lib/types/ad-sets";

interface AdSetMetricsProps {
  metrics: AdSetMetrics;
  className?: string;
}

export function AdSetMetrics({ metrics, className }: AdSetMetricsProps) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Impressions</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.impressions.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Total views
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clicks</CardTitle>
          <MousePointer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.clicks.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Total clicks
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CTR</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.ctr.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Click-through rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Spend</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics.spend.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Total spent
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
