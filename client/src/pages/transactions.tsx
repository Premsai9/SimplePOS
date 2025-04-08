import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { ArrowLeft, CalendarIcon, Search } from 'lucide-react';
import { Transaction } from '@/lib/types';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  // Filter transactions by search term and date
  const filteredTransactions = transactions?.filter(transaction => {
    // Convert transaction date to Date object if it's a string
    const txDate = typeof transaction.date === 'string' 
      ? new Date(transaction.date) 
      : transaction.date;
    
    // Filter by search term (transaction ID)
    const matchesSearch = searchTerm 
      ? transaction.id.toString().includes(searchTerm)
      : true;
    
    // Filter by date (if selected)
    const matchesDate = date 
      ? txDate.toDateString() === date.toDateString()
      : true;
    
    return matchesSearch && matchesDate;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'held':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/pos">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to POS
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Transaction History</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by transaction ID"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : 'Select date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {date && (
          <Button variant="ghost" onClick={() => setDate(undefined)} size="sm">
            Clear filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="w-full h-16" />
          ))}
        </div>
      ) : (
        <Table>
          <TableCaption>
            {filteredTransactions?.length === 0 
              ? 'No transactions found' 
              : `Showing ${filteredTransactions?.length} transactions`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right">Discount</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions?.map((transaction) => {
              // Convert transaction date to Date object if it's a string
              const txDate = typeof transaction.date === 'string' 
                ? new Date(transaction.date) 
                : transaction.date;
                
              return (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">#{transaction.id}</TableCell>
                  <TableCell>{format(txDate, 'PPP p')}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(transaction.status)}
                    >
                      {transaction.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.subtotal)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.tax)}</TableCell>
                  <TableCell className="text-right">
                    {transaction.discount ? (
                      transaction.discountType === 'percentage' ? 
                        `${transaction.discount}%` : 
                        formatCurrency(transaction.discount)
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(transaction.total)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}