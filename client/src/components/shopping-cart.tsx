import { CartItem as CartItemType, Settings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Trash, Minus, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface ShoppingCartProps {
  items: CartItemType[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
  onCheckout: () => void;
  isLoading: boolean;
  onDiscount?: () => void;
  discountAmount?: number;
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

function CartItem({ item, onUpdateQuantity, onRemoveItem }: CartItemProps) {
  // Get user's currency from settings
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });
  
  // Use currency from settings or default to USD
  const currency = settings?.currency || 'USD';
  return (
    <div className="flex items-center p-2 sm:p-3 border border-slate-200 rounded-lg">
      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-100 rounded flex-shrink-0">
        {item.product?.imageUrl ? (
          <img 
            src={item.product.imageUrl} 
            alt={item.product.name} 
            className="h-full w-full object-cover rounded" 
          />
        ) : (
          <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-400 rounded text-xs">
            No Image
          </div>
        )}
      </div>
      <div className="ml-2 sm:ml-3 flex-1">
        <div className="flex justify-between">
          <h3 className="text-xs sm:text-sm font-medium text-slate-800 truncate max-w-[120px] sm:max-w-none">{item.product?.name}</h3>
          <button 
            className="text-slate-400 hover:text-red-500 ml-1"
            onClick={() => onRemoveItem(item.id)}
          >
            <Trash size={12} className="sm:size-14" />
          </button>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs sm:text-sm font-bold text-slate-700">{currency} {item.price.toFixed(2)}</span>
          <div className="flex items-center">
            <button 
              className="h-5 w-5 sm:h-6 sm:w-6 bg-slate-100 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Minus size={10} className="sm:size-12" />
            </button>
            <input 
              type="text" 
              value={item.quantity} 
              className="h-5 w-6 sm:h-6 sm:w-8 text-center text-xs sm:text-sm border-none"
              readOnly
            />
            <button 
              className="h-5 w-5 sm:h-6 sm:w-6 bg-slate-100 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus size={10} className="sm:size-12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShoppingCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  subtotal,
  tax,
  total,
  onCheckout,
  isLoading,
  onDiscount,
  discountAmount = 0,
}: ShoppingCartProps) {
  // Get user's currency from settings
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });
  
  // Use currency from settings or default to USD
  const currency = settings?.currency || 'USD';
  // Get tax rate for display
  const taxRate = settings?.taxRate || 7.5;
  return (
    <div className="w-full h-full flex flex-col bg-white shadow-sm border-l border-slate-200">
      <div className="p-2 sm:p-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">Current Cart</h2>
          <button 
            className="text-xs sm:text-sm text-red-500 hover:text-red-600"
            onClick={onClearCart}
            disabled={items.length === 0}
          >
            <Trash className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" /> Clear
          </button>
        </div>
      </div>

      <div className="flex-1 p-2 sm:p-4 overflow-y-auto">
        {isLoading ? (
          // Loading state
          <div className="space-y-2 sm:space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center p-2 sm:p-3 border border-slate-200 rounded-lg">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded" />
                <div className="ml-2 sm:ml-3 flex-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-3 sm:w-4" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-2 sm:h-3 w-10 sm:w-12" />
                    <div className="flex items-center space-x-1">
                      <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
                      <Skeleton className="h-5 w-6 sm:h-6 sm:w-8" />
                      <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          // Empty cart state
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 flex items-center justify-center rounded-full bg-slate-100">
              <Trash size={20} className="sm:size-24" />
            </div>
            <p className="text-xs sm:text-sm">Your cart is empty</p>
            <p className="text-xs mt-1">Add products from the catalog</p>
          </div>
        ) : (
          // Cart items
          <div className="space-y-2 sm:space-y-3">
            {items.map((item) => (
              <CartItem 
                key={item.id} 
                item={item} 
                onUpdateQuantity={onUpdateQuantity} 
                onRemoveItem={onRemoveItem} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      <div className="bg-slate-50 border-t border-slate-200 p-2 sm:p-4">
        <div className="space-y-1">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium text-slate-800">{currency} {subtotal.toFixed(2)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-red-600">Discount</span>
              <span className="font-medium text-red-600">-{currency} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-slate-600">Tax ({taxRate}%)</span>
            <span className="font-medium text-slate-800">{currency} {tax.toFixed(2)}</span>
          </div>
          
          <div className="pt-2 border-t border-slate-200 mt-2">
            <div className="flex justify-between">
              <span className="text-slate-800 font-medium text-xs sm:text-sm">Total</span>
              <span className="text-base sm:text-lg font-bold text-slate-800">{currency} {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Actions */}
      <div className="p-2 sm:p-4 pb-4 sm:pb-6 flex flex-wrap sm:flex-nowrap gap-2 border-t border-slate-200">
        <Button 
          variant="secondary" 
          className="flex-1 h-10 sm:h-11 text-xs sm:text-sm px-2 sm:px-4 shadow-sm"
          onClick={onDiscount}
          disabled={items.length === 0}
        >
          {discountAmount > 0 ? 'Edit Discount' : 'Discount'}
        </Button>
        <Button 
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-10 sm:h-11 text-xs sm:text-sm px-2 sm:px-4 shadow-sm" 
          onClick={onCheckout}
          disabled={items.length === 0}
        >
          Pay
        </Button>
      </div>
    </div>
  );
}
