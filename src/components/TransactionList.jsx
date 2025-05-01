
import React from 'react';
import { TransactionCard } from './TransactionCard';

export function TransactionList({ transactions, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-gray-500">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
}
