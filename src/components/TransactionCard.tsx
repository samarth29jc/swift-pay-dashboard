
import React from 'react';
import { Transaction } from '@/context/PaymentContext';
import { Card, CardContent } from '@/components/ui/card';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { maskCardNumber } from '@/lib/card-validation';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const {
    id,
    cardHolderName,
    cardNumber,
    expiryMonth,
    expiryYear,
    amount,
    currency,
    status,
    createdAt,
    updatedAt
  } = transaction;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-gray-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{cardHolderName}</h3>
              <TransactionStatusBadge status={status} />
            </div>
            
            <div>
              <p className="text-base font-mono card-mask">{maskCardNumber(cardNumber)}</p>
              <p className="text-xs text-gray-500">Expires: {expiryMonth}/{expiryYear}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-gray-900">{formattedAmount}</span>
              <span className="text-xs text-gray-500">Transaction ID: {id.slice(0, 8)}...</span>
            </div>
            
            <div className="flex flex-col items-end text-xs text-gray-500">
              <div>Created: {formatDate(createdAt)}</div>
              {createdAt.getTime() !== updatedAt.getTime() && (
                <div>Updated: {formatDate(updatedAt)}</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
