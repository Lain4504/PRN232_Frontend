import { Metadata } from 'next';
import { PaymentHistory } from '@/components/payments/payment-history';
import { InvoiceManagement } from '@/components/payments/invoice-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Payments | AISAM',
  description: 'Manage your payments and billing',
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Manage your payment history and invoices
        </p>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment History
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          <PaymentHistory />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <InvoiceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
