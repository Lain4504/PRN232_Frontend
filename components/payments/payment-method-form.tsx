'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { 
  paymentMethodFormSchema, 
  type PaymentMethodFormData 
} from '@/lib/validators/payment';
import { 
  useAddPaymentMethod 
} from '@/hooks/use-payments';
import { 
  formatCardNumber, 
  getCardBrand, 
  validateCardNumber,
  validateCVV,
  formatExpiryDate,
  isExpiryDateValid 
} from '@/lib/utils/payments';
import { PAYMENT_METHOD_TYPES } from '@/lib/constants/payment-methods';

interface PaymentMethodFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function PaymentMethodForm({
  onSuccess,
  onCancel,
  className,
}: PaymentMethodFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardBrand, setCardBrand] = useState('');
  
  const addPaymentMethod = useAddPaymentMethod();

  const form = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: {
      type: 'card',
      billingAddress: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
      },
      isDefault: false,
    },
  });

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
    
    if (formatted.replace(/\s/g, '').length >= 13) {
      const brand = getCardBrand(formatted);
      setCardBrand(brand);
    }
  };

  const handleExpiryChange = (month: string, year: string) => {
    setExpiryMonth(month);
    setExpiryYear(year);
  };

  const onSubmit = async (data: PaymentMethodFormData) => {
    // Validate card details
    if (data.type === 'card') {
      if (!validateCardNumber(cardNumber)) {
        toast.error('Invalid card number');
        return;
      }
      
      if (!validateCVV(cvv, cardBrand)) {
        toast.error('Invalid CVV');
        return;
      }
      
      if (!isExpiryDateValid(expiryMonth, expiryYear)) {
        toast.error('Card has expired');
        return;
      }
    }

    try {
      const methodData = {
        ...data,
        cardNumber: data.type === 'card' ? cardNumber : undefined,
        expiryMonth: data.type === 'card' ? expiryMonth : undefined,
        expiryYear: data.type === 'card' ? expiryYear : undefined,
        cvv: data.type === 'card' ? cvv : undefined,
        brand: cardBrand,
        last4: cardNumber.slice(-4),
        expiry: formatExpiryDate(expiryMonth, expiryYear),
      };

      await addPaymentMethod.mutateAsync(methodData);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to add payment method');
    }
  };

  const paymentType = form.watch('type');

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Payment Method Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={PAYMENT_METHOD_TYPES.CARD}>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit/Debit Card
                      </div>
                    </SelectItem>
                    <SelectItem value={PAYMENT_METHOD_TYPES.BANK_ACCOUNT}>
                      Bank Account
                    </SelectItem>
                    <SelectItem value={PAYMENT_METHOD_TYPES.DIGITAL_WALLET}>
                      Digital Wallet
                    </SelectItem>
                    <SelectItem value={PAYMENT_METHOD_TYPES.CRYPTO}>
                      Cryptocurrency
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Card Details */}
          {paymentType === 'card' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <Label className="text-base font-medium">Card Details</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    maxLength={19}
                  />
                  {cardBrand && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {cardBrand.toUpperCase()} card detected
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    {...form.register('cardholderName')}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="expiryMonth">Month</Label>
                    <Input
                      id="expiryMonth"
                      placeholder="MM"
                      value={expiryMonth}
                      onChange={(e) => handleExpiryChange(e.target.value, expiryYear)}
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryYear">Year</Label>
                    <Input
                      id="expiryYear"
                      placeholder="YY"
                      value={expiryYear}
                      onChange={(e) => handleExpiryChange(expiryMonth, e.target.value)}
                      maxLength={4}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={4}
                    type="password"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Billing Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <Label className="text-base font-medium">Billing Address</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billingAddress.line1"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="billingAddress.line2"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apartment, suite, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="billingAddress.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="billingAddress.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="billingAddress.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="94105" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="billingAddress.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Lock className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Secure Storage</p>
              <p className="text-green-700">
                Your payment information is encrypted and stored securely. We never store your full card details.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={addPaymentMethod.isPending}
              className="flex-1"
            >
              {addPaymentMethod.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Payment Method...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add Payment Method
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={addPaymentMethod.isPending}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
