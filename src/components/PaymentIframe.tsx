
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateOrderId } from '@/lib/card-validation';

interface PaymentIframeProps {
  onPaymentStatus: (status: 'success' | 'failed' | 'pending', orderId: string) => void;
}

export function PaymentIframe({ onPaymentStatus }: PaymentIframeProps) {
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
        const paymentData = {
          orderId: orderIdRef.current,
          cardholder: '',
          cardNumber: '',
          expiryDate: '',
          cvc: '',
          amount: '',
          currency: 'USD',
          showForm: 1
        };

        iframeRef.current.contentWindow.postMessage(paymentData, 'https://celalios.com');
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onPaymentStatus]);

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
