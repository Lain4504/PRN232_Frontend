'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Settings, 
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  mockPaymentProcessing, 
  MockPaymentProcessor 
} from '@/lib/utils/mock-payment-processing';
import { 
  PaymentProcessingResult, 
  PaymentNotification 
} from '@/lib/types/payments';
import { MOCK_PAYMENT_CONFIG } from '@/lib/constants/payment-methods';

interface PaymentProcessingSimulationProps {
  className?: string;
}

interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  results: PaymentProcessingResult[];
  notifications: PaymentNotification[];
  successCount: number;
  failureCount: number;
  networkErrorCount: number;
}

export function PaymentProcessingSimulation({ className }: PaymentProcessingSimulationProps) {
  const [state, setState] = useState<SimulationState>({
    isRunning: false,
    isPaused: false,
    currentStep: 0,
    totalSteps: 10,
    results: [],
    notifications: [],
    successCount: 0,
    failureCount: 0,
    networkErrorCount: 0,
  });

  const [settings, setSettings] = useState({
    successRate: MOCK_PAYMENT_CONFIG.SUCCESS_RATE,
    failureRate: MOCK_PAYMENT_CONFIG.FAILURE_RATE,
    networkErrorRate: MOCK_PAYMENT_CONFIG.NETWORK_ERROR_RATE,
    processingDelay: MOCK_PAYMENT_CONFIG.PROCESSING_DELAY_MS,
    totalSteps: 10,
  });

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Start simulation
  const startSimulation = () => {
    if (state.isRunning) return;
    
    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      currentStep: 0,
      results: [],
      notifications: [],
      successCount: 0,
      failureCount: 0,
      networkErrorCount: 0,
    }));
    
    // Reset mock processor
    mockPaymentProcessing.reset();
    
    // Start processing payments
    const id = setInterval(() => {
      processNextPayment();
    }, settings.processingDelay);
    
    setIntervalId(id);
    toast.success('Payment simulation started');
  };

  // Pause simulation
  const pauseSimulation = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    setState(prev => ({
      ...prev,
      isPaused: true,
    }));
    
    toast.info('Payment simulation paused');
  };

  // Resume simulation
  const resumeSimulation = () => {
    if (state.isRunning && state.isPaused) {
      const id = setInterval(() => {
        processNextPayment();
      }, settings.processingDelay);
      
      setIntervalId(id);
      
      setState(prev => ({
        ...prev,
        isPaused: false,
      }));
      
      toast.info('Payment simulation resumed');
    }
  };

  // Stop simulation
  const stopSimulation = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
    }));
    
    toast.info('Payment simulation stopped');
  };

  // Reset simulation
  const resetSimulation = () => {
    stopSimulation();
    
    setState({
      isRunning: false,
      isPaused: false,
      currentStep: 0,
      totalSteps: settings.totalSteps,
      results: [],
      notifications: [],
      successCount: 0,
      failureCount: 0,
      networkErrorCount: 0,
    });
    
    mockPaymentProcessing.reset();
    toast.info('Payment simulation reset');
  };

  // Process next payment
  const processNextPayment = async () => {
    if (state.currentStep >= state.totalSteps) {
      stopSimulation();
      toast.success('Payment simulation completed');
      return;
    }

    const paymentData = {
      amount: Math.random() * 100 + 10,
      currency: 'USD',
      paymentMethodId: `pm_${Date.now()}`,
      description: `Test payment ${state.currentStep + 1}`,
    };

    try {
      const result = await mockPaymentProcessing.processPayment(paymentData);
      
      setState(prev => {
        const newResults = [...prev.results, result];
        const newNotifications = mockPaymentProcessing.getNotifications();
        
        let successCount = prev.successCount;
        let failureCount = prev.failureCount;
        let networkErrorCount = prev.networkErrorCount;
        
        if (result.success) {
          successCount++;
        } else if (result.error?.code === 'network_error') {
          networkErrorCount++;
        } else {
          failureCount++;
        }
        
        return {
          ...prev,
          currentStep: prev.currentStep + 1,
          results: newResults,
          notifications: newNotifications,
          successCount,
          failureCount,
          networkErrorCount,
        };
      });
      
    } catch (error) {
      console.error('Payment processing error:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const progress = (state.currentStep / state.totalSteps) * 100;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Payment Processing Simulation
            </CardTitle>
            <CardDescription>
              Simulate payment processing for testing and development
            </CardDescription>
          </div>
          <Badge variant={state.isRunning ? 'default' : 'secondary'}>
            {state.isRunning ? (state.isPaused ? 'Paused' : 'Running') : 'Stopped'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Simulation Controls */}
        <div className="flex gap-3">
          {!state.isRunning ? (
            <Button onClick={startSimulation} className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              Start Simulation
            </Button>
          ) : (
            <>
              {state.isPaused ? (
                <Button onClick={resumeSimulation} className="flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <Button onClick={pauseSimulation} variant="outline" className="flex-1">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button onClick={stopSimulation} variant="outline">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </>
          )}
          
          <Button onClick={resetSimulation} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{state.currentStep} / {state.totalSteps}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{state.successCount}</p>
            <p className="text-sm text-muted-foreground">Successful</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{state.failureCount}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{state.networkErrorCount}</p>
            <p className="text-sm text-muted-foreground">Network Errors</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Activity className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{state.notifications.length}</p>
            <p className="text-sm text-muted-foreground">Notifications</p>
          </div>
        </div>

        {/* Recent Results */}
        {state.results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Recent Results</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {state.results.slice(-5).map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {result.success ? 'Payment Successful' : 'Payment Failed'}
                    </p>
                    {result.paymentId && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {result.paymentId}
                      </p>
                    )}
                    {result.error && (
                      <p className="text-xs text-red-600">
                        {result.error.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Success Rate</p>
              <p className="font-medium">{(settings.successRate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Failure Rate</p>
              <p className="font-medium">{(settings.failureRate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Network Error Rate</p>
              <p className="font-medium">{(settings.networkErrorRate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Processing Delay</p>
              <p className="font-medium">{settings.processingDelay}ms</p>
            </div>
          </div>
        </div>

        {/* Status */}
        {state.isRunning && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              {state.isPaused 
                ? 'Simulation is paused. Click Resume to continue.'
                : 'Simulation is running. Processing payments...'
              }
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
