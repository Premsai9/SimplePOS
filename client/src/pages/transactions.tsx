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
    <div className="container mx-auto p-2 sm:p-4">
      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-0 mb-4 sm:mb-6">
        <Link href="/pos">
          <Button variant="ghost" size="sm" className="mr-2 sm:mr-4 h-8 px-2 text-xs sm:text-sm">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Back to POS
          </Button>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold">Transaction History</h1>
      </div>

      <div className="flex flex-col xs:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            placeholder="Search by transaction ID"
            className="pl-8 sm:pl-9 text-xs sm:text-sm h-8 sm:h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full xs:w-auto h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4">
              <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">
                {date ? format(date, 'PP') : 'Select date'}
              </span>
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
          <Button 
            variant="ghost" 
            onClick={() => setDate(undefined)} 
            size="sm"
            className="h-8 text-xs sm:text-sm px-2"
          >
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
      ) : filteredTransactions?.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <div className="mb-2">
            <Search className="h-10 w-10 mx-auto text-slate-300" />
          </div>
          <p className="text-sm">No transactions found</p>
        </div>
      ) : (
        <>
          {/* Mobile view - card style */}
          <div className="md:hidden space-y-4">
            {filteredTransactions?.map((transaction) => {
              // Convert transaction date to Date object if it's a string
              const txDate = typeof transaction.date === 'string' 
                ? new Date(transaction.date) 
                : transaction.date;
                
              return (
                <div key={transaction.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-slate-500 text-xs">Transaction</span>
                      <p className="font-semibold">#{transaction.id}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(transaction.status)}
                    >
                      {transaction.status || 'active'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-slate-500 text-xs">Date</span>
                      <p>{format(txDate, 'PP')}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Payment</span>
                      <p>{transaction.paymentMethod}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Subtotal:</span>
                      <span>{formatCurrency(transaction.subtotal)}</span>
                    </div>
                    {transaction.discount ? (
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-500">Discount:</span>
                        <span className="text-red-500">
                          {transaction.discountType === 'percentage' ? 
                            `${transaction.discount}%` : 
                            formatCurrency(transaction.discount)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Tax:</span>
                      <span>{formatCurrency(transaction.tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold mt-1 pt-1 border-t border-slate-100">
                      <span>Total:</span>
                      <span>{formatCurrency(transaction.total)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="text-center text-sm text-slate-500 mt-4">
              Showing {filteredTransactions?.length} transactions
            </p>
          </div>
          
          {/* Desktop view - table */}
          <div className="hidden md:block">
            <Table>
              <TableCaption>
                {`Showing ${filteredTransactions?.length} transactions`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Payment Method</TableHead>
                  <TableHead className="text-xs text-right">Subtotal</TableHead>
                  <TableHead className="text-xs text-right">Tax</TableHead>
                  <TableHead className="text-xs text-right">Discount</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
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
                      <TableCell className="font-medium text-xs">#{transaction.id}</TableCell>
                      <TableCell className="text-xs">{format(txDate, 'PPP p')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(transaction.status)}`}
                        >
                          {transaction.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{transaction.paymentMethod}</TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(transaction.subtotal)}</TableCell>
                      <TableCell className="text-right text-xs">{formatCurrency(transaction.tax)}</TableCell>
                      <TableCell className="text-right text-xs">
                        {transaction.discount ? (
                          transaction.discountType === 'percentage' ? 
                            `${transaction.discount}%` : 
                            formatCurrency(transaction.discount)
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs">{formatCurrency(transaction.total)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}