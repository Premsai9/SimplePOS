import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Percent, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Settings } from "@/lib/types";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  onApplyDiscount: (discountAmount: number, discountType: 'percentage' | 'amount') => void;
}

export default function DiscountModal({
  isOpen,
  onClose,
  subtotal,
  onApplyDiscount,
}: DiscountModalProps) {
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Get user's currency settings
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  // Use currency from settings or default to USD
  const currency = settings?.currency || 'USD';

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setDiscountValue(isNaN(value) ? 0 : value);
  };

  const handleApplyDiscount = () => {
    if (discountValue <= 0) {
      return;
    }
    
    // Make sure percentage discount is not more than 100%
    if (discountType === 'percentage' && discountValue > 100) {
      setDiscountValue(100);
    }
    
    // Make sure amount discount is not more than subtotal
    if (discountType === 'amount' && discountValue > subtotal) {
      setDiscountValue(subtotal);
    }

    onApplyDiscount(discountValue, discountType);
    onClose();
  };

  const calculateDiscountAmount = () => {
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    } else {
      return discountValue;
    }
  };

  const newTotal = subtotal - calculateDiscountAmount();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <DialogHeader className="border-b border-slate-200 pb-4">
          <DialogTitle className="text-lg font-semibold text-slate-800">Apply Discount</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">Subtotal</span>
              <span className="text-lg font-bold text-slate-700">{currency} {subtotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <span className="text-sm font-medium text-slate-700 block mb-1">Discount Type</span>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                className={discountType === "percentage" ? "bg-blue-500 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}
                onClick={() => setDiscountType("percentage")}
              >
                <Percent className="mr-1 h-4 w-4" /> Percentage
              </Button>
              <Button 
                className={discountType === "amount" ? "bg-blue-500 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}
                onClick={() => setDiscountType("amount")}
              >
                <DollarSign className="mr-1 h-4 w-4" /> Amount
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                {discountType === 'percentage' ? '%' : currency}
              </span>
              <Input 
                type="number"
                value={discountValue.toString()}
                onChange={handleDiscountChange}
                min={0}
                max={discountType === 'percentage' ? 100 : subtotal}
                step={discountType === 'percentage' ? 1 : 0.01}
                className="w-full px-8 py-2 text-right font-medium"
              />
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-slate-50 rounded mt-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-slate-700">Discount Amount</span>
              <span className="text-lg font-bold text-red-600">-{currency} {calculateDiscountAmount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-slate-200">
              <span className="text-sm font-medium text-slate-700">New Total</span>
              <span className="text-lg font-bold text-green-600">{currency} {newTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 flex space-x-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" 
            onClick={handleApplyDiscount}
            disabled={discountValue <= 0}
          >
            Apply Discount
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}