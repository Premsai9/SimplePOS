import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Save, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import CategoryManagementModal from "@/components/category-management-modal";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Category } from "@/lib/types";

// Define settings schema
const settingsSchema = z.object({
  // Store info
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative").max(30, "Tax rate cannot exceed 30%"),
  currency: z.string().min(1, "Please select a currency"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  
  // Receipt settings
  showLogo: z.boolean().default(true),
  showTaxDetails: z.boolean().default(true),
  footerText: z.string().optional(),
  
  // Advanced options
  enableInventoryTracking: z.boolean().default(true),
  enableDiscounts: z.boolean().default(true),
  enableHoldOrders: z.boolean().default(false),
  defaultCategory: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Initialize form with default values
  const defaultValues: SettingsFormValues = {
    storeName: "My POS Store",
    taxRate: 8.5,
    currency: "USD",
    address: "123 Main St, City, State",
    phone: "(555) 123-4567",
    email: "contact@mystore.com",
    showLogo: true,
    showTaxDetails: true,
    footerText: "Thank you for your business!",
    enableInventoryTracking: true,
    enableDiscounts: true,
    enableHoldOrders: false,
    defaultCategory: "All",
  };
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });
  
  // Load settings from localStorage on page load
  useEffect(() => {
    const savedSettings = localStorage.getItem("pos-settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        form.reset(parsedSettings);
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, [form]);
  
  const onSubmit = async (data: SettingsFormValues) => {
    setIsSaving(true);
    try {
      // Save settings to localStorage
      localStorage.setItem("pos-settings", JSON.stringify(data));
      
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link to="/pos" className="text-slate-600 hover:text-slate-900">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={isSaving}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="store" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="store">Store Information</TabsTrigger>
              <TabsTrigger value="receipt">Receipt Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            </TabsList>
            
            {/* Store Information Tab */}
            <TabsContent value="store" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>
                    Configure your store information that will appear on receipts and reports.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="storeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your Store Name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              max="30" 
                              step="0.01" 
                              placeholder="8.5" 
                            />
                          </FormControl>
                          <FormDescription>
                            Default sales tax percentage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="USD" />
                          </FormControl>
                          <FormDescription>
                            e.g., USD, EUR, JPY
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    These details will be displayed on receipts and reports.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123 Main St, City, State" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="(555) 123-4567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="contact@mystore.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Receipt Settings Tab */}
            <TabsContent value="receipt" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Receipt Appearance</CardTitle>
                  <CardDescription>
                    Customize how your receipts look when printed or emailed to customers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-4">
                    <FormField
                      control={form.control}
                      name="showLogo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Show Store Logo</FormLabel>
                            <FormDescription>
                              Display your store logo at the top of receipts
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="showTaxDetails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Show Tax Details</FormLabel>
                            <FormDescription>
                              Display itemized tax information on receipts
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <FormField
                    control={form.control}
                    name="footerText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receipt Footer Text</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Thank you for your business!" />
                        </FormControl>
                        <FormDescription>
                          Custom message to display at the bottom of each receipt
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Advanced Options Tab */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>
                    Configure advanced settings for your point of sale system.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-4">
                    <FormField
                      control={form.control}
                      name="enableInventoryTracking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Enable Inventory Tracking</FormLabel>
                            <FormDescription>
                              Automatically update product inventory when sales are made
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="enableDiscounts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Enable Discounts</FormLabel>
                            <FormDescription>
                              Allow applying discounts to transactions
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="enableHoldOrders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Enable Hold Orders</FormLabel>
                            <FormDescription>
                              Allow putting transactions on hold to complete later
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <Label>Product Categories</Label>
                        <p className="text-sm text-muted-foreground">
                          Manage categories for organizing your products
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="ml-3"
                        onClick={() => setIsCategoryModalOpen(true)}
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        Manage Categories
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <FormField
                    control={form.control}
                    name="defaultCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Category</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="All" />
                        </FormControl>
                        <FormDescription>
                          Default category to show when opening the POS
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      if (confirm("Are you sure you want to reset all settings to default values?")) {
                        form.reset(defaultValues);
                        toast({
                          title: "Settings reset",
                          description: "All settings have been reset to their default values.",
                        });
                      }
                    }}
                  >
                    Reset to Defaults
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>

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