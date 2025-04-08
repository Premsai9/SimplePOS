import { CartItem as CartItemType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Trash, Minus, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

function CartItem({ item, onUpdateQuantity, onRemoveItem }: CartItemProps) {
  return (
    <div className="flex items-center p-3 border border-slate-200 rounded-lg">
      <div className="h-12 w-12 bg-slate-100 rounded flex-shrink-0">
        {item.product?.imageUrl ? (
          <img 
            src={item.product.imageUrl} 
            alt={item.product.name} 
            className="h-full w-full object-cover rounded" 
          />
        ) : (
          <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-400 rounded">
            No Image
          </div>
        )}
      </div>
      <div className="ml-3 flex-1">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium text-slate-800">{item.product?.name}</h3>
          <button 
            className="text-slate-400 hover:text-red-500"
            onClick={() => onRemoveItem(item.id)}
          >
            <Trash size={14} />
          </button>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm font-bold text-slate-700">${item.price.toFixed(2)}</span>
          <div className="flex items-center">
            <button 
              className="h-6 w-6 bg-slate-100 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Minus size={12} />
            </button>
            <input 
              type="text" 
              value={item.quantity} 
              className="h-6 w-8 text-center text-sm border-none"
              readOnly
            />
            <button 
              className="h-6 w-6 bg-slate-100 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus size={12} />
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
}: ShoppingCartProps) {
  return (
    <div className="w-full lg:w-5/12 h-1/2 lg:h-full flex flex-col bg-white shadow-sm border-l border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Current Cart</h2>
          <button 
            className="text-sm text-red-500 hover:text-red-600"
            onClick={onClearCart}
            disabled={items.length === 0}
          >
            <Trash className="h-4 w-4 inline mr-1" /> Clear
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          // Loading state
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center p-3 border border-slate-200 rounded-lg">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-12" />
                    <div className="flex items-center space-x-1">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-6 w-8" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          // Empty cart state
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-slate-100">
              <Trash size={24} />
            </div>
            <p className="text-sm">Your cart is empty</p>
            <p className="text-xs mt-1">Add products from the catalog</p>
          </div>
        ) : (
          // Cart items
          <div className="space-y-3">
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
      <div className="bg-slate-50 border-t border-slate-200 p-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium text-slate-800">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tax (8%)</span>
            <span className="font-medium text-slate-800">${tax.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 mt-2">
            <div className="flex justify-between">
              <span className="text-slate-800 font-medium">Total</span>
              <span className="text-lg font-bold text-slate-800">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Actions */}
      <div className="p-4 flex space-x-2 border-t border-slate-200">
        <Button 
          variant="secondary" 
          className="flex-1"
          disabled={items.length === 0}
        >
          Hold
        </Button>
        <Button 
          variant="secondary" 
          className="flex-1"
          disabled={items.length === 0}
        >
          Discount
        </Button>
        <Button 
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" 
          onClick={onCheckout}
          disabled={items.length === 0}
        >
          Pay
        </Button>
      </div>
    </div>
  );
}
