
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateOrderId } from '@/lib/card-validation';

interface PaymentIframeProps {
  onPaymentStatus: (status: 'success' | 'failed' | 'pending', orderId: string) => void;
  paymentData?: {
    cardholderName?: string;
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cardCVC?: string;
    amount?: number;
    currency?: string;
  };
}

export function PaymentIframe({ onPaymentStatus, paymentData }: PaymentIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const orderIdRef = useRef(generateOrderId());

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      // Verify that the message is from our iframe (security check)
      if (event.origin !== 'https://celalios.com') {
        return;
      }

      try {
        const data = event.data;
        if (data && data.status) {
          // Update payment status based on iframe response
          onPaymentStatus(
            data.status as 'success' | 'failed' | 'pending',
            data.orderId || orderIdRef.current
          );
        }
      } catch (error) {
        console.error('Error processing iframe message:', error);
      }
    };

    window.addEventListener('message', handleMessage);

    // Set up the iframe with initial data
    setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // Format expiryDate as MM/YY if month and year are available
        let expiryDate = '';
        if (paymentData?.expiryMonth && paymentData?.expiryYear) {
          const year = paymentData.expiryYear.slice(-2); // Take last two digits
          expiryDate = `${paymentData.expiryMonth}/${year}`;
        }

        const messageData = {
          orderId: orderIdRef.current,
          cardholder: paymentData?.cardholderName || '',
          cardNumber: paymentData?.cardNumber || '',
          expiryDate: expiryDate,
          cvc: paymentData?.cardCVC || '',
          amount: paymentData?.amount ? String(paymentData.amount) : '',
          currency: paymentData?.currency || 'USD',
          showForm: 1
        };

        iframeRef.current.contentWindow.postMessage(messageData, 'https://celalios.com');
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onPaymentStatus, paymentData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iframe Checkout</CardTitle>
        <CardDescription>
          Complete your payment securely within the iframe below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative border rounded-md">
          <iframe
            ref={iframeRef}
            src="https://celalios.com/"
            title="Payment Form"
            className="w-full h-[400px]"
            sandbox="allow-forms allow-scripts allow-same-origin"
          />
        </div>
      </CardContent>
    </Card>
  );
}
