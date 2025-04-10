import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentForm, Settings } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onProcessPayment: (payment: PaymentForm) => void;
  isLoading: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  total,
  onProcessPayment,
  isLoading,
}: PaymentModalProps) {
  const [amountTendered, setAmountTendered] = useState(
    Math.ceil(total * 100) / 100 // Round up to nearest cent
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  
  // Get user's currency settings
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });
  
  // Use currency from settings or default to USD
  const currency = settings?.currency || 'USD';
  
  const changeDue = amountTendered - total;
  const isValidPayment = paymentMethod === "Cash" ? amountTendered >= total : true;

  const handleSubmit = () => {
    if (!isValidPayment) return;
    
    onProcessPayment({
      amountTendered,
      paymentMethod,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        <DialogHeader className="border-b border-slate-200 pb-4">
          <DialogTitle className="text-lg font-semibold text-slate-800">Complete Payment</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">Total Amount</span>
              <span className="text-lg font-bold text-blue-600">{currency} {total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <span className="text-sm font-medium text-slate-700 block mb-1">Payment Method</span>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                className={paymentMethod === "Cash" ? "bg-blue-500 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}
                onClick={() => setPaymentMethod("Cash")}
              >
                Cash
              </Button>
              <Button 
                className={paymentMethod === "Card" ? "bg-blue-500 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}
                onClick={() => setPaymentMethod("Card")}
              >
                Card
              </Button>
              <Button 
                className={paymentMethod === "Mobile" ? "bg-blue-500 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}
                onClick={() => setPaymentMethod("Mobile")}
              >
                Mobile
              </Button>
            </div>
          </div>
          
          {paymentMethod === "Cash" && (
            <>
              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 block mb-1">Amount Tendered</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">{currency}</span>
                  <Input 
                    type="number"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min={total}
                    className="w-full px-8 py-2 text-right font-medium"
                  />
                </div>
                {amountTendered < total && (
                  <p className="text-red-500 text-xs mt-1">Amount must be at least {currency} {total.toFixed(2)}</p>
                )}
              </div>
              
              <div className="mb-4 p-3 bg-slate-50 rounded">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-700">Change Due</span>
                  <span className={`text-lg font-bold ${changeDue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currency} {changeDue.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-200 flex space-x-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" 
            onClick={handleSubmit}
            disabled={!isValidPayment || isLoading}
          >
            {isLoading ? "Processing..." : "Complete Sale"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
