import { Metadata } from 'next';
import { PaymentProcessingSimulation } from '@/components/payments/payment-processing-simulation';
import { PaymentAlertSystem } from '@/components/payments/payment-alert-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Payment Processing | AISAM',
  description: 'Payment processing simulation and testing tools',
};

export default function PaymentProcessingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Processing</h1>
        <p className="text-muted-foreground">
          Simulate payment processing and test payment flows
        </p>
      </div>

      <Tabs defaultValue="simulation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simulation" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Processing Simulation
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alert System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="space-y-6">
          <PaymentProcessingSimulation />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <PaymentAlertSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
}
