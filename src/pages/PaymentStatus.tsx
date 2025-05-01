
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePayment } from '@/context/PaymentContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, XCircle, ArrowLeft, Clock3 } from 'lucide-react';

const StatusDisplay = ({ status }: { status: string }) => {
  switch (status) {
    case 'success':
      return (
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h2>
          <p className="text-gray-500">
            Your payment has been processed successfully
          </p>
        </div>
      );
    case 'failed':
      return (
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-500">
            There was an error processing your payment
          </p>
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
            <Clock3 className="h-8 w-8 text-yellow-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Processing</h2>
          <p className="text-gray-500">
            Your payment is being processed
          </p>
        </div>
      );
  }
};

const PaymentStatus = () => {
  const { id, status } = useParams<{ id: string, status: string }>();
  const navigate = useNavigate();
  const { getTransaction } = usePayment();
  
  const transaction = id ? getTransaction(id) : undefined;
  const paymentStatus = status || transaction?.status || 'pending';

  useEffect(() => {
    // If no status or transaction found, redirect to dashboard after a delay
    if (!status && !transaction) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [status, transaction, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-center">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-6">
              <StatusDisplay status={paymentStatus} />
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentStatus;
