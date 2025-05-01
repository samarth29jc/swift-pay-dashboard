import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardForm } from '@/components/CardForm';
import { PaymentIframe } from '@/components/PaymentIframe';
import { usePayment } from '@/context/PaymentContext';
import { generateOrderId } from '@/lib/card-validation';
import { toast } from 'sonner';
import { Check, CreditCard, Layout } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { addTransaction, updateTransactionStatus } = usePayment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Handle server-to-server payment submission
  const handleS2SSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Generate a random order ID
      const orderId = generateOrderId();
      
      // Prepare payment data for API
      const paymentData = {
        orderId,
        cardHolderName: data.cardHolderName,
        cardNumber: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cardCVC: data.cardCVC,
        amount: parseFloat(data.amount),
        currency: data.currency
      };
      
      // Add transaction to context with pending status
      const transactionId = addTransaction(paymentData);
      
      toast.success('Payment submitted', {
        description: 'Your payment is being processed'
      });
      
      // Make actual API call to vancipay.com
      try {
        const response = await fetch('https://api.vancipay.com/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paymentData)
        });
        
        if (response.ok) {
          const responseData = await response.json();
          
          // In a real implementation, this would handle the redirect URL
          // For now, we'll simulate success and redirect to the payment status page
          updateTransactionStatus(transactionId, 'success');
          
          // If there was a redirectUrl in the response, we would use:
          // window.location.href = responseData.redirectUrl;
          
          // For this implementation, we'll redirect to our internal status page
          navigate(`/payment-status/${transactionId}/success`);
        } else {
          // Handle API error
          console.error('Payment API error:', await response.text());
          updateTransactionStatus(transactionId, 'failed');
          navigate(`/payment-status/${transactionId}/failed`);
        }
      } catch (error) {
        // Handle fetch errors (network issues, CORS, etc.)
        console.error('Payment fetch error:', error);
        updateTransactionStatus(transactionId, 'failed');
        navigate(`/payment-status/${transactionId}/failed`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('Payment failed', {
        description: 'There was an error processing your payment'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to prepare data for the iframe - modified to return a Promise
  const prepareIframeData = async (data: any): Promise<void> => {
    return new Promise<void>((resolve) => {
      setPaymentData({
        cardholderName: data.cardHolderName,
        cardNumber: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cardCVC: data.cardCVC,
        amount: parseFloat(data.amount),
        currency: data.currency
      });
      resolve();
    });
  };

  // Handle iframe payment status updates
  const handleIframePaymentStatus = (status: 'success' | 'failed' | 'pending', orderId: string) => {
    // Create a transaction record with available payment data or defaults
    const transactionData = {
      cardHolderName: paymentData?.cardholderName || 'Iframe Payment',
      cardNumber: paymentData?.cardNumber || '4111111111111111',
      expiryMonth: paymentData?.expiryMonth || '12',
      expiryYear: paymentData?.expiryYear || '2025',
      cardCVC: paymentData?.cardCVC || '123',
      amount: paymentData?.amount || 10.00,
      currency: paymentData?.currency || 'USD'
    };
    
    const transactionId = addTransaction(transactionData);
    
    // Update the transaction status based on iframe response
    updateTransactionStatus(transactionId, status);
    
    if (status === 'success') {
      toast.success('Payment successful', {
        description: 'Your payment has been processed successfully'
      });
      navigate(`/payment-status/${transactionId}/success`);
    } else if (status === 'failed') {
      toast.error('Payment failed', {
        description: 'There was an error processing your payment'
      });
      navigate(`/payment-status/${transactionId}/failed`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500">
            Choose a payment method to complete your purchase
          </p>
        </div>
        
        <Tabs defaultValue="s2s" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="s2s" className="flex items-center">
              <Layout className="h-4 w-4 mr-2" />
              Server-to-Server
            </TabsTrigger>
            <TabsTrigger value="iframe" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Iframe Integration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="s2s" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Enter your card information to complete the payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardForm onSubmit={handleS2SSubmit} isSubmitting={isSubmitting} />
                
                <div className="mt-6">
                  <p className="text-xs text-gray-500 flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                    Your card details are securely processed. We don't store your full card number.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="iframe" className="animate-fade-in">
            <CardForm 
              onSubmit={prepareIframeData}
              isSubmitting={false}
              submitButtonText="Prepare Checkout"
            />
            {paymentData && (
              <div className="mt-6">
                <PaymentIframe 
                  onPaymentStatus={handleIframePaymentStatus}
                  paymentData={paymentData} 
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Checkout;
