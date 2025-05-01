
import React, { useState } from 'react';
import { usePayment } from '@/context/PaymentContext';
import { Header } from '@/components/Header';
import { TransactionList } from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CreditCard, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { transactions } = usePayment();
  const [filter, setFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');
  
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === filter);
  
  const counts = {
    all: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    success: transactions.filter(t => t.status === 'success').length,
    failed: transactions.filter(t => t.status === 'failed').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage your payment transactions
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Button asChild>
              <Link to="/checkout" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                New Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                All <Badge className="ml-1">{counts.all}</Badge>
              </Button>
              <Button 
                variant={filter === 'pending' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pending <Badge className="ml-1">{counts.pending}</Badge>
              </Button>
              <Button 
                variant={filter === 'success' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('success')}
              >
                Success <Badge className="ml-1">{counts.success}</Badge>
              </Button>
              <Button 
                variant={filter === 'failed' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('failed')}
              >
                Failed <Badge className="ml-1">{counts.failed}</Badge>
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <TransactionList transactions={filteredTransactions} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
