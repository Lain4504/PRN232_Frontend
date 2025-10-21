import { 
  Payment, 
  Invoice,
  Transaction, 
  PaymentProcessingResult,
  PaymentError,
  PaymentNotification
} from '@/lib/types/payments';
import { 
  PAYMENT_ERROR_CODES, 
  MOCK_PAYMENT_CONFIG,
  PAYMENT_STATUSES,
  INVOICE_STATUSES,
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  PAYMENT_NOTIFICATION_TYPES
} from '@/lib/constants/payment-methods';

// Mock payment processing simulation
export class MockPaymentProcessor {
  private static instance: MockPaymentProcessor;
  private processingQueue: Map<string, PaymentProcessingResult> = new Map();
  private notifications: PaymentNotification[] = [];

  static getInstance(): MockPaymentProcessor {
    if (!MockPaymentProcessor.instance) {
      MockPaymentProcessor.instance = new MockPaymentProcessor();
    }
    return MockPaymentProcessor.instance;
  }

  // Simulate payment processing with realistic delays and outcomes
  async processPayment(paymentData: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    description?: string;
  }): Promise<PaymentProcessingResult> {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate processing delay
    await this.delay(MOCK_PAYMENT_CONFIG.PROCESSING_DELAY_MS);
    
    // Determine success/failure based on mock configuration
    const random = Math.random();
    let result: PaymentProcessingResult;
    
    if (random < MOCK_PAYMENT_CONFIG.SUCCESS_RATE) {
      result = {
        success: true,
        paymentId,
      };
      
      // Create successful payment
      const payment = await this.createSuccessfulPayment(paymentId, paymentData);
      this.processingQueue.set(paymentId, result);
      
      // Send success notification
      await this.sendNotification({
        type: PAYMENT_NOTIFICATION_TYPES.PAYMENT_SUCCEEDED,
        title: 'Payment Successful',
        message: `Your payment of ${paymentData.currency} ${paymentData.amount} has been processed successfully.`,
        paymentId,
      });
      
    } else if (random < MOCK_PAYMENT_CONFIG.SUCCESS_RATE + MOCK_PAYMENT_CONFIG.FAILURE_RATE) {
      // Simulate payment failure
      const errorCode = this.getRandomErrorCode();
      const error: PaymentError = {
        code: errorCode,
        message: this.getErrorMessage(errorCode),
      };
      
      result = {
        success: false,
        error,
      };
      
      // Send failure notification
      await this.sendNotification({
        type: PAYMENT_NOTIFICATION_TYPES.PAYMENT_FAILED,
        title: 'Payment Failed',
        message: `Your payment of ${paymentData.currency} ${paymentData.amount} could not be processed. ${error.message}`,
        paymentId,
      });
      
    } else {
      // Simulate network error
      const error: PaymentError = {
        code: PAYMENT_ERROR_CODES.NETWORK_ERROR,
        message: 'Network error occurred during payment processing',
      };
      
      result = {
        success: false,
        error,
      };
    }
    
    return result;
  }

  // Simulate payment retry
  async retryPayment(paymentId: string, newPaymentMethodId?: string): Promise<PaymentProcessingResult> {
    await this.delay(1000); // Shorter delay for retry
    
    const random = Math.random();
    
    if (random < 0.7) { // 70% success rate for retries
      return {
        success: true,
        paymentId,
      };
    } else {
      const errorCode = this.getRandomErrorCode();
      return {
        success: false,
        error: {
          code: errorCode,
          message: this.getErrorMessage(errorCode),
        },
      };
    }
  }

  // Create a successful payment record
  private async createSuccessfulPayment(paymentId: string, paymentData: {amount: number; currency: string; paymentMethodId: string}): Promise<Payment> {
    const payment: Payment = {
      id: paymentId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: PAYMENT_STATUSES.SUCCEEDED,
      method: {
        id: paymentData.paymentMethodId,
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiry: '12/25',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      date: new Date().toISOString(),
      description: paymentData.description || 'Payment',
      reference: `ref_${Date.now()}`,
      metadata: paymentData.metadata,
    };
    
    return payment;
  }

  // Generate random error codes for realistic failure simulation
  private getRandomErrorCode(): string {
    const errorCodes = [
      PAYMENT_ERROR_CODES.CARD_DECLINED,
      PAYMENT_ERROR_CODES.INSUFFICIENT_FUNDS,
      PAYMENT_ERROR_CODES.EXPIRED_CARD,
      PAYMENT_ERROR_CODES.INCORRECT_CVC,
      PAYMENT_ERROR_CODES.PROCESSING_ERROR,
    ];
    
    return errorCodes[Math.floor(Math.random() * errorCodes.length)];
  }

  // Get user-friendly error messages
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case PAYMENT_ERROR_CODES.CARD_DECLINED:
        return 'Your card was declined by the bank.';
      case PAYMENT_ERROR_CODES.INSUFFICIENT_FUNDS:
        return 'Insufficient funds in your account.';
      case PAYMENT_ERROR_CODES.EXPIRED_CARD:
        return 'Your card has expired.';
      case PAYMENT_ERROR_CODES.INCORRECT_CVC:
        return 'The security code is incorrect.';
      case PAYMENT_ERROR_CODES.PROCESSING_ERROR:
        return 'An error occurred while processing your payment.';
      case PAYMENT_ERROR_CODES.NETWORK_ERROR:
        return 'Network error occurred. Please try again.';
      default:
        return 'An unexpected error occurred.';
    }
  }

  // Send notification
  private async sendNotification(notificationData: {
    type: string;
    title: string;
    message: string;
    paymentId?: string;
    invoiceId?: string;
  }): Promise<void> {
    const notification: PaymentNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: notificationData.type as 'payment_succeeded' | 'payment_failed' | 'payment_reminder' | 'invoice_generated' | 'invoice_overdue' | 'refund_processed' | 'chargeback_received',
      title: notificationData.title,
      message: notificationData.message,
      paymentId: notificationData.paymentId,
      invoiceId: notificationData.invoiceId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    this.notifications.push(notification);
    
    // In a real app, this would trigger actual notifications
    console.log('Mock notification sent:', notification);
  }

  // Simulate invoice generation
  async generateInvoice(paymentId: string): Promise<Invoice> {
    await this.delay(500);
    
    const invoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      amount: Math.random() * 100 + 10, // Random amount between 10-110
      currency: 'USD',
      status: INVOICE_STATUSES.OPEN,
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      items: [
        {
          id: `item_${Date.now()}`,
          description: 'Service subscription',
          quantity: 1,
          unitPrice: Math.random() * 100 + 10,
          total: Math.random() * 100 + 10,
          type: 'subscription',
        },
      ],
      downloadUrl: `/api/invoices/inv_${Date.now()}/download`,
      paymentId,
    };
    
    // Send invoice notification
    await this.sendNotification({
      type: PAYMENT_NOTIFICATION_TYPES.INVOICE_GENERATED,
      title: 'New Invoice Available',
      message: `Invoice ${invoice.number} has been generated and is ready for download.`,
      invoiceId: invoice.id,
    });
    
    return invoice;
  }

  // Simulate transaction creation
  async createTransaction(paymentId: string, type: string = TRANSACTION_TYPES.PAYMENT): Promise<Transaction> {
    await this.delay(200);
    
    const transaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as 'payment' | 'refund' | 'chargeback' | 'adjustment' | 'fee',
      amount: Math.random() * 100 + 10,
      currency: 'USD',
      status: TRANSACTION_STATUSES.COMPLETED,
      date: new Date().toISOString(),
      description: `Transaction for payment ${paymentId}`,
      reference: `ref_${Date.now()}`,
      paymentId,
    };
    
    return transaction;
  }

  // Simulate payment status updates
  async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    await this.delay(300);
    
    // In a real app, this would update the payment status in the database
    console.log(`Mock payment status updated: ${paymentId} -> ${status}`);
    
    // Send appropriate notification based on status
    if (status === PAYMENT_STATUSES.SUCCEEDED) {
      await this.sendNotification({
        type: PAYMENT_NOTIFICATION_TYPES.PAYMENT_SUCCEEDED,
        title: 'Payment Completed',
        message: 'Your payment has been successfully processed.',
        paymentId,
      });
    } else if (status === PAYMENT_STATUSES.FAILED) {
      await this.sendNotification({
        type: PAYMENT_NOTIFICATION_TYPES.PAYMENT_FAILED,
        title: 'Payment Failed',
        message: 'Your payment could not be processed.',
        paymentId,
      });
    }
  }

  // Simulate payment reminders
  async sendPaymentReminder(invoiceId: string): Promise<void> {
    await this.delay(1000);
    
    await this.sendNotification({
      type: PAYMENT_NOTIFICATION_TYPES.PAYMENT_REMINDER,
      title: 'Payment Reminder',
      message: 'You have an upcoming payment due. Please ensure your payment method is up to date.',
      invoiceId,
    });
  }

  // Simulate overdue invoice notifications
  async sendOverdueNotification(invoiceId: string): Promise<void> {
    await this.delay(1000);
    
    await this.sendNotification({
      type: PAYMENT_NOTIFICATION_TYPES.INVOICE_OVERDUE,
      title: 'Invoice Overdue',
      message: 'Your invoice is now overdue. Please make payment immediately to avoid service interruption.',
      invoiceId,
    });
  }

  // Simulate refund processing
  async processRefund(paymentId: string, amount: number): Promise<PaymentProcessingResult> {
    await this.delay(2000);
    
    const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Send refund notification
    await this.sendNotification({
      type: PAYMENT_NOTIFICATION_TYPES.REFUND_PROCESSED,
      title: 'Refund Processed',
      message: `Your refund of $${amount} has been processed and will appear in your account within 3-5 business days.`,
      paymentId,
    });
    
    return {
      success: true,
      paymentId: refundId,
    };
  }

  // Simulate chargeback processing
  async processChargeback(paymentId: string): Promise<void> {
    await this.delay(1000);
    
    await this.sendNotification({
      type: PAYMENT_NOTIFICATION_TYPES.CHARGEBACK_RECEIVED,
      title: 'Chargeback Received',
      message: 'A chargeback has been initiated for one of your payments. Please review the details.',
      paymentId,
    });
  }

  // Get all notifications
  getNotifications(): PaymentNotification[] {
    return [...this.notifications];
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  // Mark all notifications as read
  markAllNotificationsAsRead(): void {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
  }

  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Reset mock data (useful for testing)
  reset(): void {
    this.processingQueue.clear();
    this.notifications = [];
  }
}

// Export singleton instance
export const mockPaymentProcessor = MockPaymentProcessor.getInstance();

// Utility functions for easy integration
export const mockPaymentProcessing = {
  processPayment: (paymentData: {amount: number; currency: string; paymentMethodId: string}) => mockPaymentProcessor.processPayment(paymentData),
  retryPayment: (paymentId: string, newPaymentMethodId?: string) => 
    mockPaymentProcessor.retryPayment(paymentId, newPaymentMethodId),
  generateInvoice: (paymentId: string) => mockPaymentProcessor.generateInvoice(paymentId),
  createTransaction: (paymentId: string, type?: string) => 
    mockPaymentProcessor.createTransaction(paymentId, type),
  updatePaymentStatus: (paymentId: string, status: string) => 
    mockPaymentProcessor.updatePaymentStatus(paymentId, status),
  sendPaymentReminder: (invoiceId: string) => mockPaymentProcessor.sendPaymentReminder(invoiceId),
  sendOverdueNotification: (invoiceId: string) => mockPaymentProcessor.sendOverdueNotification(invoiceId),
  processRefund: (paymentId: string, amount: number) => 
    mockPaymentProcessor.processRefund(paymentId, amount),
  processChargeback: (paymentId: string) => mockPaymentProcessor.processChargeback(paymentId),
  getNotifications: () => mockPaymentProcessor.getNotifications(),
  markNotificationAsRead: (notificationId: string) => 
    mockPaymentProcessor.markNotificationAsRead(notificationId),
  markAllNotificationsAsRead: () => mockPaymentProcessor.markAllNotificationsAsRead(),
  reset: () => mockPaymentProcessor.reset(),
};
