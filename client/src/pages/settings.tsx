import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Save, Tag, Image as ImageIcon } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

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
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// Define settings schema
const settingsSchema = z.object({
  // Store info
  storeName: z.string().min(2, "Store name must be at least 2 characters"),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative").max(30, "Tax rate cannot exceed 30%"),
  currency: z.string().min(1, "Please select a currency"),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
  storeEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  
  // Receipt settings
  showLogo: z.boolean().default(true),
  logoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  showTaxDetails: z.boolean().default(true),
  receiptFooter: z.string().optional(),
  
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
  const [imageError, setImageError] = useState(false);
  
  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Initialize form with default values
  const defaultValues: SettingsFormValues = {
    storeName: "My POS Store",
    taxRate: 8.5,
    currency: "USD",
    storeAddress: "123 Main St, City, State",
    storePhone: "(555) 123-4567",
    storeEmail: "contact@mystore.com",
    showLogo: true,
    logoUrl: "",
    showTaxDetails: true,
    receiptFooter: "Thank you for your business!",
    enableInventoryTracking: true,
    enableDiscounts: true,
    enableHoldOrders: false,
    defaultCategory: "All",
  };
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });
  
  // Define user settings type
  type UserSettings = {
    currency: string;
    taxRate: number;
    storeName?: string;
    storeAddress?: string;
    storePhone?: string;
    storeEmail?: string;
    receiptFooter?: string;
    showLogo?: boolean;
    logoUrl?: string;
  };
  
  // Fetch user settings from the server
  const { user } = useAuth();
  const { data: userSettings, isLoading: isLoadingSettings } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
    enabled: !!user,
  });
  
  // Update form when settings are loaded
  useEffect(() => {
    if (userSettings) {
      // Set all server-side settings
      form.setValue('currency', userSettings.currency);
      form.setValue('taxRate', userSettings.taxRate);
      
      // Set optional store information if available
      if (userSettings.storeName) {
        form.setValue('storeName', userSettings.storeName);
      }
      if (userSettings.storeAddress) {
        form.setValue('storeAddress', userSettings.storeAddress);
      }
      if (userSettings.storePhone) {
        form.setValue('storePhone', userSettings.storePhone);
      }
      if (userSettings.storeEmail) {
        form.setValue('storeEmail', userSettings.storeEmail);
      }
      if (userSettings.receiptFooter) {
        form.setValue('receiptFooter', userSettings.receiptFooter);
      }
      // Set logo settings
      form.setValue('showLogo', userSettings.showLogo ?? true);
      form.setValue('logoUrl', userSettings.logoUrl || '');
    }
  }, [userSettings, form]);
  
  // Also load other settings from localStorage for fields not stored in the database
  useEffect(() => {
    const savedSettings = localStorage.getItem("pos-settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // We'll set all values except currency and taxRate which come from the server
        const { currency, taxRate, ...otherSettings } = parsedSettings;
        
        // Only update localStorage settings that don't come from the server
        Object.entries(otherSettings).forEach(([key, value]) => {
          form.setValue(key as any, value as any);
        });
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, [form]);
  
  // Save settings mutation
  const saveSettingsMutation = useMutation<
    UserSettings, 
    Error, 
    UserSettings
  >({
    mutationFn: async (settings) => {
      const response = await apiRequest('PUT', '/api/settings', settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save settings: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = async (data: SettingsFormValues) => {
    setIsSaving(true);
    try {
      // Extract store information for server-side storage
      const serverSettings: UserSettings = {
        currency: data.currency,
        taxRate: data.taxRate,
        storeName: data.storeName || undefined,
        storeAddress: data.storeAddress || undefined,
        storePhone: data.storePhone || undefined,
        storeEmail: data.storeEmail || undefined,
        receiptFooter: data.receiptFooter || undefined,
        showLogo: data.showLogo,
        logoUrl: data.logoUrl || undefined
      };
      
      console.log('Saving settings:', serverSettings); // Debug log
      
      // Save all settings to the server
      await saveSettingsMutation.mutateAsync(serverSettings);
      
      // Save other settings to localStorage (like UI preferences)
      const localSettings = {
        showLogo: data.showLogo,
        showTaxDetails: data.showTaxDetails,
        enableInventoryTracking: data.enableInventoryTracking,
        enableDiscounts: data.enableDiscounts,
        enableHoldOrders: data.enableHoldOrders,
        defaultCategory: data.defaultCategory,
        logoUrl: data.logoUrl // Also save logo URL in localStorage as backup
      };
      
      console.log('Saving local settings:', localSettings); // Debug log
      localStorage.setItem("pos-settings", JSON.stringify(localSettings));
    } catch (error) {
      // Error is handled by the mutation
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
                    name="storeAddress"
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
                      name="storePhone"
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
                      name="storeEmail"
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
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="url" 
                              placeholder="https://example.com/logo.png"
                              disabled={!form.watch("showLogo")}
                              onChange={(e) => {
                                field.onChange(e);
                                setImageError(false);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the URL of your store logo image (supported formats: PNG, JPG, JPEG)
                          </FormDescription>
                          <FormMessage />
                          {field.value && form.watch("showLogo") && (
                            <div className="mt-2">
                              <div className="border rounded-lg p-4 bg-slate-50">
                                {imageError ? (
                                  <div className="flex items-center justify-center h-32 text-slate-500">
                                    <div className="text-center">
                                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                                      <p className="text-sm">Failed to load image</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative h-32 bg-white rounded border">
                                    <img
                                      src={field.value}
                                      alt="Store Logo Preview"
                                      className="h-full mx-auto object-contain p-2"
                                      onError={() => setImageError(true)}
                                    />
                                  </div>
                                )}
                                <p className="text-sm text-slate-500 mt-2">Logo Preview</p>
                              </div>
                            </div>
                          )}
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
                    name="receiptFooter"
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