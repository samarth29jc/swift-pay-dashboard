
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

// Define the transaction type
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  id: string;
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cardCVC: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => string;
  updateTransactionStatus: (id: string, status: TransactionStatus) => void;
  getTransaction: (id: string) => Transaction | undefined;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load transactions from localStorage on initial render
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions);
        // Convert string dates back to Date objects
        const withDates = parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt)
        }));
        setTransactions(withDates);
      } catch (error) {
        console.error('Failed to parse stored transactions:', error);
      }
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Auto-update pending transactions randomly for demo purposes
  useEffect(() => {
    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    
    if (pendingTransactions.length === 0) return;
    
    const randomUpdateInterval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * pendingTransactions.length);
      const transactionToUpdate = pendingTransactions[randomIdx];
      
      if (transactionToUpdate) {
        const newStatus: TransactionStatus = Math.random() > 0.3 ? 'success' : 'failed';
        updateTransactionStatus(transactionToUpdate.id, newStatus);
        
        // Show toast notification for status change
        toast(`Payment ${newStatus}`, {
          description: `Transaction ${transactionToUpdate.id.slice(0, 8)} status updated to ${newStatus}`,
          position: "bottom-right",
        });
      }
    }, 6000 + Math.random() * 10000); // Random interval between 6-16 seconds
    
    return () => clearInterval(randomUpdateInterval);
  }, [transactions]);

  // Add a new transaction
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'status'>): string => {
    const now = new Date();
    const newId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const newTransaction: Transaction = {
      ...transaction,
      id: newId,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Show toast notification
    toast("Payment processing", {
      description: "Your payment is being processed",
      position: "bottom-right",
    });
    
    return newId;
  };

  // Update a transaction's status
  const updateTransactionStatus = (id: string, status: TransactionStatus) => {
    setTransactions(prev => 
      prev.map(transaction => {
        if (transaction.id === id) {
          return {
            ...transaction,
            status,
            updatedAt: new Date()
          };
        }
        return transaction;
      })
    );
  };

  // Get a transaction by ID
  const getTransaction = (id: string): Transaction | undefined => {
    return transactions.find(transaction => transaction.id === id);
  };

  return (
    <PaymentContext.Provider value={{ transactions, addTransaction, updateTransactionStatus, getTransaction }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}
