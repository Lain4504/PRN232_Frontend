'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Plus, Check, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentMethod } from '@/lib/types/payments';
import { 
  usePaymentMethods, 
  useSetDefaultPaymentMethod, 
  useRemovePaymentMethod 
} from '@/hooks/use-payments';
import { formatPaymentMethod } from '@/lib/utils/payments';
import { PaymentMethodForm } from './payment-method-form';

interface PaymentMethodSelectorProps {
  selectedMethodId?: string;
  onMethodSelect: (methodId: string) => void;
  showAddButton?: boolean;
  className?: string;
}

export function PaymentMethodSelector({
  selectedMethodId,
  onMethodSelect,
  showAddButton = true,
  className,
}: PaymentMethodSelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data: paymentMethods, isLoading } = usePaymentMethods();
  const setDefaultMethod = useSetDefaultPaymentMethod();
  const removeMethod = useRemovePaymentMethod();

  const handleSetDefault = async (methodId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await setDefaultMethod.mutateAsync(methodId);
    } catch (error) {
      toast.error('Failed to set default payment method');
    }
  };

  const handleRemove = async (methodId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await removeMethod.mutateAsync(methodId);
      if (selectedMethodId === methodId) {
        onMethodSelect('');
      }
    } catch (error) {
      toast.error('Failed to remove payment method');
    }
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    toast.success('Payment method added successfully');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading payment methods...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Select or manage your payment methods
            </CardDescription>
          </div>
          {showAddButton && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new payment method to your account
                  </DialogDescription>
                </DialogHeader>
                <PaymentMethodForm onSuccess={handleAddSuccess} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {paymentMethods && paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                isSelected={selectedMethodId === method.id}
                onSelect={() => onMethodSelect(method.id)}
                onSetDefault={(e) => handleSetDefault(method.id, e)}
                onRemove={(e) => handleRemove(method.id, e)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Payment Methods</h3>
            <p className="text-muted-foreground mb-4">
              Add a payment method to get started
            </p>
            {showAddButton && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                    <DialogDescription>
                      Add a new payment method to your account
                    </DialogDescription>
                  </DialogHeader>
                  <PaymentMethodForm onSuccess={handleAddSuccess} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
  onSetDefault: (event: React.MouseEvent) => void;
  onRemove: (event: React.MouseEvent) => void;
}

function PaymentMethodCard({
  method,
  isSelected,
  onSelect,
  onSetDefault,
  onRemove,
}: PaymentMethodCardProps) {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
        isSelected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{formatPaymentMethod(method)}</p>
              {method.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Default
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Expires {method.expiry}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSelected && (
            <div className="p-1 rounded-full bg-primary text-primary-foreground">
              <Check className="h-3 w-3" />
            </div>
          )}
          
          <div className="flex items-center gap-1">
            {!method.isDefault && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onSetDefault}
                className="h-8 w-8 p-0"
                title="Set as default"
              >
                <Star className="h-3 w-3" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Remove payment method"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
