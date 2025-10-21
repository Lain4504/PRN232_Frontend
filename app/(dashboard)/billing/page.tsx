import { Metadata } from 'next';
import { BillingSettings } from '@/components/payments/billing-settings';

export const metadata: Metadata = {
  title: 'Billing Settings | AISAM',
  description: 'Manage your billing information and payment methods',
};

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing Settings</h1>
        <p className="text-muted-foreground">
          Manage your billing information, payment methods, and notifications
        </p>
      </div>

      <BillingSettings />
    </div>
  );
}
