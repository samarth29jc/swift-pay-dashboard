
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

// Simulated WebSocket for demo purposes
class SimulatedWebSocket {
  private callbacks: Map<string, (data: any) => void> = new Map();
  private interval: ReturnType<typeof setInterval> | null = null;
  private transactions: Transaction[] = [];

  connect() {
    console.log('WebSocket connected');
    // Simulate receiving updates every 2-5 seconds
    this.interval = setInterval(() => {
      if (this.transactions.length > 0) {
        const pendingTransactions = this.transactions.filter(t => t.status === 'pending');
        if (pendingTransactions.length > 0) {
          const randomIndex = Math.floor(Math.random() * pendingTransactions.length);
          const transaction = pendingTransactions[randomIndex];
          const newStatus: TransactionStatus = Math.random() > 0.3 ? 'success' : 'failed';
          
          this.sendEvent('transaction_updated', {
            id: transaction.id,
            status: newStatus,
            updatedAt: new Date()
          });
        }
      }
    }, 2000 + Math.floor(Math.random() * 3000));
  }

  disconnect() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('WebSocket disconnected');
  }

  setTransactions(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  on(eventName: string, callback: (data: any) => void) {
    this.callbacks.set(eventName, callback);
    return this;
  }

  off(eventName: string) {
    this.callbacks.delete(eventName);
    return this;
  }

  sendEvent(eventName: string, data: any) {
    const callback = this.callbacks.get(eventName);
    if (callback) {
      setTimeout(() => callback(data), 0);
    }
  }
}

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [websocket] = useState(() => new SimulatedWebSocket());

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
    websocket.setTransactions(transactions);
  }, [transactions, websocket]);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    websocket.connect();
    
    websocket.on('transaction_updated', (data) => {
      updateTransactionStatus(data.id, data.status);
      
      // Show toast notification for status change
      toast(`Payment ${data.status}`, {
        description: `Transaction ${data.id.slice(0, 8)} status updated to ${data.status}`,
        position: "bottom-right",
      });
    });
    
    return () => {
      websocket.disconnect();
    };
  }, [websocket]);

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
