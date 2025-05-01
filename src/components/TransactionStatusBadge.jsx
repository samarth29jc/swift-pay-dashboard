
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock3, XCircle } from 'lucide-react';

export function TransactionStatusBadge({ status, className }) {
  const getStatusDetails = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          icon: <Clock3 className="h-3 w-3 mr-1" />,
          className: 'bg-warning/20 text-warning border-warning/20'
        };
      case 'success':
        return {
          label: 'Success',
          icon: <Check className="h-3 w-3 mr-1" />,
          className: 'bg-success/20 text-success border-success/20'
        };
      case 'failed':
        return {
          label: 'Failed',
          icon: <XCircle className="h-3 w-3 mr-1" />,
          className: 'bg-error/20 text-error border-error/20'
        };
      default:
        return {
          label: 'Unknown',
          icon: null,
          className: 'bg-gray-200 text-gray-800'
        };
    }
  };

  const { label, icon, className: statusClassName } = getStatusDetails();

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border animate-fade-in',
        statusClassName,
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}
