import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Plus, Edit, Tag } from "lucide-react";
import { Product, Category, Settings } from "@/lib/types";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import AddProductModal from "./add-product-modal";
import EditProductModal from "./edit-product-modal";
import CategoryManagementModal from "./category-management-modal";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  onSelectCategory: (category: string) => void;
  onSearch: (query: string) => void;
  onAddToCart: (product: Product) => void;
  isLoading: boolean;
}

export default function ProductCatalog({
  products,
  categories,
  selectedCategory,
  searchQuery,
  onSelectCategory,
  onSearch,
  onAddToCart,
  isLoading,
}: ProductCatalogProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useAuth();
  
  // Fetch settings to get currency
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
    enabled: !!user,
  });

  return (
    <div className="w-full h-full bg-white overflow-hidden flex flex-col shadow-sm">
      <div className="p-2 sm:p-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">Product Catalog</h2>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => setIsAddProductModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs">Add Product</span>
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            {/* Category Filter Dropdown - Mobile only */}
            <div className="sm:hidden w-full">
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full px-3 py-1.5 h-9 justify-between">
                    <span>{selectedCategory}</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-auto mx-2">
                  {categories.map((category) => (
                    <DropdownMenuItem 
                      key={category.id} 
                      onClick={() => {
                        onSelectCategory(category.name);
                        setDropdownOpen(false);
                      }}
                    >
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full px-3 py-1.5 h-9 pr-9"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </span>
            </div>
          </div>
        </div>
        
        {/* Category Pills - Desktop only */}
        <div className="hidden sm:flex space-x-1 overflow-x-auto pb-2">
          <div className="flex items-center space-x-1 mr-1">
            <Button
              variant="outline"
              size="sm"
              className="px-2 py-1 h-7 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
              onClick={() => setIsCategoryModalOpen(true)}
            >
              <Tag className="h-3 w-3 mr-1" />
              <span className="text-xs">Manage</span>
            </Button>
          </div>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? "default" : "outline"}
              className={`px-3 py-1 sm:py-1.5 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === category.name 
                  ? "bg-blue-500 text-white" 
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => onSelectCategory(category.name)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 p-2 sm:p-4 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 auto-rows-fr">
          {isLoading ? (
            // Loading state
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden h-full">
                <Skeleton className="h-24 sm:h-32 w-full" />
                <div className="p-2 sm:p-3">
                  <Skeleton className="h-3 sm:h-4 w-3/4 mb-2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-2 sm:h-3 w-16" />
                    <Skeleton className="h-2 sm:h-3 w-12" />
                  </div>
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            // Empty state
            <div className="col-span-full flex justify-center items-center h-40 text-slate-400">
              No products found
            </div>
          ) : (
            // Product cards
            products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden relative h-full flex flex-col"
              >
                {/* Edit button overlay */}
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 bg-white bg-opacity-80 hover:bg-white hover:bg-opacity-100 border-slate-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                      setIsEditProductModalOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3 text-slate-600" />
                  </Button>
                </div>
                
                {/* Product content */}
                <div 
                  className="cursor-pointer active:bg-slate-50 flex flex-col h-full"
                  onClick={() => onAddToCart(product)}
                >
                  <div className="aspect-[4/3] w-full bg-slate-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs sm:text-sm">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-2 sm:p-3 flex flex-col flex-grow">
                    <h3 className="text-xs sm:text-sm font-medium text-slate-800 mb-auto line-clamp-2">{product.name}</h3>
                    <div className="flex justify-between items-center gap-1 mt-1.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-700 truncate">
                        {new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: settings?.currency || 'USD'
                        }).format(product.price)}
                      </span>
                      <span className="text-xs text-slate-500 whitespace-nowrap">Stock: {product.inventory}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        categories={categories}
        onSuccess={() => {
          // Will automatically refresh the product list using React Query's cache invalidation
        }}
      />
      
      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => setIsEditProductModalOpen(false)}
        categories={categories}
        product={selectedProduct}
        onSuccess={() => {
          setSelectedProduct(null);
        }}
      />

      {/* Category Management Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSuccess={() => {
          // Will automatically refresh categories using React Query's cache invalidation
        }}
      />
    </div>
  );
}
