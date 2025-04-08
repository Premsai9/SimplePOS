import { useEffect } from "react";
import POSLayout from "@/components/pos-layout";
import ProductCatalog from "@/components/product-catalog";
import ShoppingCart from "@/components/shopping-cart";
import PaymentModal from "@/components/payment-modal";
import ReceiptModal from "@/components/receipt-modal";
import DiscountModal from "@/components/discount-modal";
import { usePOS } from "@/hooks/use-pos";
import { useToast } from "@/hooks/use-toast";

export default function POS() {
  const {
    products,
    cartItems,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    cartSubtotal,
    cartTax,
    cartTotal,
    isPaymentModalOpen,
    setPaymentModalOpen,
    isReceiptModalOpen,
    setReceiptModalOpen,
    isDiscountModalOpen,
    setDiscountModalOpen,
    discountAmount,
    applyDiscount,
    currentTransaction,
    processPayment,
    completeSale,
    isLoading,
  } = usePOS();

  const { toast } = useToast();

  // Display toast for errors
  useEffect(() => {
    if (isLoading.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: isLoading.errorMessage || "An error occurred",
      });
    }
  }, [isLoading.error, isLoading.errorMessage, toast]);

  return (
    <POSLayout>
      <div className="h-full flex flex-col md:flex-row">
        <div className="w-full md:w-7/12 h-[50vh] md:h-full overflow-hidden">
          <ProductCatalog
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onSelectCategory={setSelectedCategory}
            onSearch={setSearchQuery}
            onAddToCart={(product) => {
              addToCart(product);
              toast({
                title: "Item Added",
                description: `${product.name} added to cart`,
                className: "bg-green-500 text-white",
              });
            }}
            isLoading={isLoading.products}
          />
        </div>
        
        <div className="w-full md:w-5/12 h-[50vh] md:h-full overflow-hidden">
          <ShoppingCart
            items={cartItems}
            onUpdateQuantity={updateCartItem}
            onRemoveItem={removeCartItem}
            onClearCart={clearCart}
            subtotal={cartSubtotal}
            tax={cartTax}
            total={cartTotal}
            onCheckout={() => setPaymentModalOpen(true)}
            isLoading={isLoading.cart}
            onDiscount={() => setDiscountModalOpen(true)}
            discountAmount={discountAmount}
          />
        </div>
      </div>

      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          total={cartTotal}
          onProcessPayment={processPayment}
          isLoading={isLoading.payment}
        />
      )}

      {isReceiptModalOpen && currentTransaction && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          transaction={currentTransaction}
          onNewSale={completeSale}
        />
      )}

      {/* Discount Modal */}
      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
        subtotal={cartSubtotal}
        onApplyDiscount={applyDiscount}
      />
    </POSLayout>
  );
}
