import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { InsertCategory } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { Category } from '@/lib/types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Create schema for category
const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess?: () => void;
}

export default function CategoryManagementModal({
  isOpen,
  onClose,
  categories,
  onSuccess,
}: CategoryManagementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('manage');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
  });

  // Reset form when modal is opened or when editingCategory changes
  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
      });
    } else {
      form.reset({
        name: '',
      });
    }
  }, [form, editingCategory, isOpen]);

  const filteredCategories = categories.filter(cat => cat.name !== 'All');

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setActiveTab('add');
  };

  const handleDeleteCategory = async (category: Category) => {
    // No built-in endpoint for category deletion, but we would add one
    // For now, just show a toast indicating this functionality would be implemented
    toast({
      title: 'Delete Category',
      description: `This feature is not yet implemented. Would delete category: ${category.name}`,
      variant: 'default',
    });
  };

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update category - endpoint not yet implemented in backend
        toast({
          title: 'Edit Category',
          description: `This feature is not yet implemented. Would update category ID ${editingCategory.id} to: ${data.name}`,
          variant: 'default',
        });
      } else {
        // Create new category
        await apiRequest('POST', '/api/categories', data);
        toast({
          title: 'Success',
          description: 'Category added successfully',
        });
      }
      
      form.reset({ name: '' });
      setEditingCategory(null);
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      
      if (onSuccess) onSuccess();
      setActiveTab('manage');
    } catch (error) {
      toast({
        title: 'Error',
        description: editingCategory 
          ? 'Failed to update category' 
          : 'Failed to add category',
        variant: 'destructive',
      });
      console.error('Category operation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Category Management</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'add' | 'manage')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Manage Categories</TabsTrigger>
            <TabsTrigger value="add">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manage" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Available Categories</h3>
              <Button 
                size="sm" 
                onClick={() => {
                  setEditingCategory(null);
                  setActiveTab('add');
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteCategory(category)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                        No categories found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="add">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter category name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="flex justify-between sm:justify-between gap-2">
                  <div className="flex gap-2">
                    {editingCategory && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setEditingCategory(null);
                          form.reset({ name: '' });
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setActiveTab('manage');
                        if (editingCategory) setEditingCategory(null);
                      }}
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}