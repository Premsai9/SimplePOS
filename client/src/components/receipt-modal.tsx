import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Printer, Mail } from "lucide-react";
import { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onNewSale: () => void;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  transaction,
  onNewSale,
}: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${transaction.id}`,
  });

  const handleEmailReceipt = () => {
    alert("Email receipt functionality would be implemented here");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <DialogHeader className="border-b border-slate-200 pb-4">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold text-slate-800">Receipt</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <div 
            ref={receiptRef} 
            className="bg-white p-4 border border-slate-200 rounded mb-4"
            style={{ maxWidth: "300px", margin: "0 auto" }}
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold">SimplePOS</h3>
              <p className="text-sm text-slate-600">123 Main Street</p>
              <p className="text-sm text-slate-600">Anytown, ST 12345</p>
              <p className="text-sm text-slate-600">Tel: (555) 123-4567</p>
            </div>
            
            <div className="text-sm mb-4">
              <div className="flex justify-between mb-1">
                <span>Receipt #:</span>
                <span>INV-{format(new Date(transaction.date), "yyyyMMdd")}-{transaction.id.toString().padStart(3, '0')}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Date:</span>
                <span>{format(new Date(transaction.date), "MMMM d, yyyy h:mm a")}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Cashier:</span>
                <span>Cashier</span>
              </div>
            </div>
            
            <div className="border-t border-b border-slate-200 py-2 mb-3">
              <div className="flex justify-between mb-1 text-sm font-medium">
                <span className="w-5/12">Item</span>
                <span className="w-2/12 text-center">Qty</span>
                <span className="w-2/12 text-right">Price</span>
                <span className="w-3/12 text-right">Total</span>
              </div>
            </div>
            
            <div className="space-y-1 mb-4">
              {transaction.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="w-5/12">{item.product?.name}</span>
                  <span className="w-2/12 text-center">{item.quantity}</span>
                  <span className="w-2/12 text-right">${item.price.toFixed(2)}</span>
                  <span className="w-3/12 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-200 pt-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${transaction.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span>${transaction.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold mt-1">
                <span>Total:</span>
                <span>${transaction.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Payment ({transaction.paymentMethod}):</span>
                <span>${transaction.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-center text-sm">
              <p>Thank you for your purchase!</p>
              <p>Please come again.</p>
              <div className="mt-2">
                <div className="text-center">
                  {/* Barcode placeholder */}
                  <div className="h-8 my-2 mx-auto bg-slate-800 w-3/4"></div>
                  <span className="text-xs text-slate-600">{transaction.id.toString().padStart(10, '0')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleEmailReceipt}
          >
            <Mail className="mr-1 h-4 w-4" /> Email
          </Button>
          <Button 
            variant="default"
            className="flex-1 bg-blue-500 hover:bg-blue-600"
            onClick={handlePrint}
          >
            <Printer className="mr-1 h-4 w-4" /> Print
          </Button>
          <Button 
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => {
              onNewSale();
              onClose();
            }}
          >
            New Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
