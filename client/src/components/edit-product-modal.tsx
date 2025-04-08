import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { InsertProduct } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category, Product } from '@/lib/types';

// Create schema based on InsertProduct with validation
const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Please select a category'),
  inventory: z.coerce.number().min(0, 'Inventory cannot be negative'),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  product: Product | null;
  onSuccess?: () => void;
}

export default function EditProductModal({
  isOpen,
  onClose,
  categories,
  product,
  onSuccess,
}: EditProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredCategories = categories.filter(cat => cat.name !== 'All');

  const defaultValues: ProductFormValues = {
    name: '',
    price: 0,
    category: '',
    inventory: 0,
    imageUrl: '',
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  // Set form values when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        price: product.price,
        category: product.category,
        inventory: product.inventory,
        imageUrl: product.imageUrl || '',
      });
    }
  }, [product, form]);

  const onSubmit = async (data: ProductFormValues) => {
    if (!product) return;

    setIsSubmitting(true);
    try {
      await apiRequest('PUT', `/api/products/${product.id}`, data);
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
      console.error('Failed to update product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('DELETE', `/api/products/${product.id}`);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
      console.error('Failed to delete product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Make changes to the product information below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter product name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">$</span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inventory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inventory</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" placeholder="Quantity in stock" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/image.jpg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button type="button" variant="destructive" onClick={handleDelete} className="sm:mr-auto" disabled={isSubmitting}>
                Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}