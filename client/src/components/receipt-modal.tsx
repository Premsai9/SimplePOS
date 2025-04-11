import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Printer, Mail } from "lucide-react";
import { format } from "date-fns";

interface TransactionItem {
  id: string | number;
  product: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface Transaction {
  id: string | number;
  date: string | Date;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  total: number;
}

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

  const handlePrint = () => {
    if (!receiptRef.current) {
      console.error("Receipt ref is not assigned");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      console.error("Failed to open print window");
      alert("Please allow pop-ups to print the receipt.");
      return;
    }

    const printContent = receiptRef.current.outerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: Arial, sans-serif;
            }
            .receipt-print {
              width: 300px;
              margin: 0;
              padding: 10mm;
              box-sizing: border-box;
            }
            .store-info {
              text-align: center;
              margin-bottom: 10mm;
            }
            .store-name {
              font-size: 16px;
              font-weight: bold;
            }
            .store-address, .store-phone {
              font-size: 12px;
            }
            .receipt-details {
              margin-bottom: 5mm;
            }
            .detail-line {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
              font-size: 12px;
            }
            .receipt-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10mm;
            }
            .receipt-table th, .receipt-table td {
              border: 1px solid #ccc;
              padding: 5px;
              font-size: 12px;
            }
            .receipt-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .receipt-table td:nth-child(2), .receipt-table th:nth-child(2) {
              text-align: center;
            }
            .receipt-table td:nth-child(3), .receipt-table th:nth-child(3),
            .receipt-table td:nth-child(4), .receipt-table th:nth-child(4) {
              text-align: right;
            }
            .totals {
              margin-bottom: 10mm;
            }
            .total-line {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
              font-size: 12px;
            }
            .total-line.total {
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 12px;
            }
            @media print {
              @page {
                size: auto;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

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
          <div ref={receiptRef} className="receipt-print bg-white p-4 border border-slate-200 rounded mb-4">
            <div className="store-info text-center mb-4">
              <h3 className="store-name text-lg font-bold">My Store</h3>
              <p className="store-address text-sm text-gray-600">123 Store Address</p>
              <p className="store-phone text-sm text-gray-600">Tel: (123) 456-7890</p>
            </div>

            <div className="receipt-details mb-2">
              <div className="detail-line flex justify-between mb-1 text-sm">
                <span>Receipt #:</span>
                <span>INV-{format(new Date(transaction.date), "yyyyMMdd")}-{transaction.id.toString().padStart(3, '0')}</span>
              </div>
              <div className="detail-line flex justify-between mb-1 text-sm">
                <span>Date:</span>
                <span>{format(new Date(transaction.date), "MMMM d, yyyy h:mm a")}</span>
              </div>
            </div>

            <table className="receipt-table w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-100 font-bold border border-gray-300 p-1 text-sm">Item</th>
                  <th className="bg-gray-100 font-bold border border-gray-300 p-1 text-sm text-center">Qty</th>
                  <th className="bg-gray-100 font-bold border border-gray-300 p-1 text-sm text-right">Price</th>
                  <th className="bg-gray-100 font-bold border border-gray-300 p-1 text-sm text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map((item: TransactionItem) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-1 text-sm">{item.product.name}</td>
                    <td className="border border-gray-300 p-1 text-sm text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-1 text-sm text-right">$ {item.price.toFixed(2)}</td>
                    <td className="border border-gray-300 p-1 text-sm text-right">$ {(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="totals mb-4">
              <div className="total-line flex justify-between mb-1 text-sm">
                <span>Subtotal:</span>
                <span>$ {transaction.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-line flex justify-between mb-1 text-sm">
                <span>Tax (0%):</span>
                <span>$ {transaction.tax.toFixed(2)}</span>
              </div>
              <div className="total-line total flex justify-between mb-1 text-sm font-bold">
                <span>Total:</span>
                <span>$ {transaction.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="footer text-center text-sm">
              <p>Thank you for shopping with us!</p>
              <p>Please come again.</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex space-x-2">
          <Button variant="outline" className="flex-1" onClick={handleEmailReceipt}>
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