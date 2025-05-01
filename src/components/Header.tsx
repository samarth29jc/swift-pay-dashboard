
import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, LayoutDashboard } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-500" />
                <h1 className="ml-2 text-xl font-bold text-gray-900">SwiftPay</h1>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex space-x-4">
            <Link
              to="/"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                location.pathname === "/"
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
              )}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/checkout"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                location.pathname.includes("/checkout")
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
              )}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Checkout
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
