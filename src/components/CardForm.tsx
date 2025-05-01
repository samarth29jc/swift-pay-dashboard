
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  validateCardNumber, 
  validateExpiryDate, 
  validateCVV, 
  formatCardNumber,
  maskCardNumber
} from '@/lib/card-validation';
import { toast } from 'sonner';
import { Loader2, EyeIcon, EyeOffIcon } from 'lucide-react';

// Form schema with validation
const cardSchema = z.object({
  cardHolderName: z.string().min(3, { message: 'Cardholder name is required' }),
  cardNumber: z.string()
    .min(13, { message: 'Card number is invalid' })
    .refine((val) => validateCardNumber(val), { message: 'Invalid card number' }),
  expiryMonth: z.string()
    .regex(/^(0[1-9]|1[0-2])$/, { message: 'Month must be between 01-12' }),
  expiryYear: z.string()
    .regex(/^(20)?[2-9][0-9]$/, { message: 'Invalid year' }),
  cardCVC: z.string()
    .regex(/^\d{3,4}$/, { message: 'CVV must be 3-4 digits' }),
  amount: z.string().min(1, { message: 'Amount is required' })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, { 
      message: 'Amount must be greater than zero' 
    }),
  currency: z.string().min(1, { message: 'Currency is required' }),
}).refine((data) => {
  return validateExpiryDate(data.expiryMonth, data.expiryYear);
}, {
  message: 'Card is expired',
  path: ['expiryYear'] // Path to the field with the error
});

type CardFormValues = z.infer<typeof cardSchema>;

interface CardFormProps {
  onSubmit: (data: CardFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function CardForm({ onSubmit, isSubmitting = false }: CardFormProps) {
  const [formattedCardNumber, setFormattedCardNumber] = useState('');
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [cardType, setCardType] = useState('');
  
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardHolderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cardCVC: '',
      amount: '',
      currency: 'USD'
    },
  });

  const detectCardType = (number: string) => {
    // Basic card type detection based on IIN ranges
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.startsWith('4')) {
      return 'Visa';
    } else if (/^5[1-5]/.test(cleanNumber)) {
      return 'Mastercard';
    } else if (/^3[47]/.test(cleanNumber)) {
      return 'American Express';
    } else if (/^6(?:011|5)/.test(cleanNumber)) {
      return 'Discover';
    }
    return '';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = formatCardNumber(value);
    setFormattedCardNumber(formatted);
    form.setValue('cardNumber', value);
    
    // Detect and set card type
    setCardType(detectCardType(value));
  };

  const handleSubmission = async (values: CardFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Payment processing failed', {
        description: 'There was an error processing your payment. Please try again.'
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmission)} className="space-y-6">
        <FormField
          control={form.control}
          name="cardHolderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cardholder Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field: { onChange, ...rest } }) => (
            <FormItem>
              <FormLabel>Card Number {cardType && <span className="text-sm text-muted-foreground ml-2">({cardType})</span>}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    className="card-number-input pr-10"
                    placeholder="1234 5678 9012 3456" 
                    value={showCardNumber ? formattedCardNumber : maskCardNumber(formattedCardNumber)}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    {...rest}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCardNumber(!showCardNumber)}
                    tabIndex={-1}
                  >
                    {showCardNumber ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="expiryMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Month</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="MM" 
                    maxLength={2}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiryYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="YY" 
                    maxLength={4}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cardCVC"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CVV</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showCVV ? "text" : "password"} 
                      placeholder="123" 
                      maxLength={4}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        field.onChange(value);
                      }}
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowCVV(!showCVV)}
                      tabIndex={-1}
                    >
                      {showCVV ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="text"
                    placeholder="100.00" 
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d.]/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            'Pay Now'
          )}
        </Button>
      </form>
    </Form>
  );
}
