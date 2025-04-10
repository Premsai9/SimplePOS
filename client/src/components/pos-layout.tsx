import { ReactNode, useState, useEffect } from "react";
import { format } from "date-fns";
import { ScanBarcode, ChevronDown, History, BarChart, Menu, Settings, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface POSLayoutProps {
  children: ReactNode;
}

export default function POSLayout({ children }: POSLayoutProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();

  // Update the current date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Format date as "Month Day, Year | HH:MM AM/PM"
  const formattedDateTime = format(currentDateTime, "MMMM d, yyyy | h:mm a");

  const menuItems = [
    { label: "Settings", icon: <Settings size={16} />, href: "/settings" },
    { label: "History", icon: <History size={16} />, href: "/transactions" },
    { label: "Analytics", icon: <BarChart size={16} />, href: "/analytics" },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          {/* Top Row - Logo and Menu */}
          <div className="flex justify-between items-center mb-2 sm:mb-0">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500 text-2xl">
                <ScanBarcode size={28} />
              </span>
              <h1 className="text-xl font-bold text-slate-800">SimplePOS</h1>
            </div>
            
            {/* Mobile Menu */}
            {isMobile ? (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 text-slate-700 hover:text-blue-500">
                    <Menu size={24} />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] px-0">
                  <div className="flex flex-col h-full">
                    {/* User Info */}
                    <div className="px-6 py-4 border-b">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{user?.username || "Cashier"}</span>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <nav className="px-2 py-4">
                      {menuItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <a className="flex items-center space-x-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                            {item.icon}
                            <span>{item.label}</span>
                          </a>
                        </Link>
                      ))}
                      <button 
                        onClick={() => logoutMutation.mutate()} 
                        className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-red-600 hover:bg-slate-50 rounded-lg"
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut size={16} />
                        <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                      </button>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              /* Desktop Menu */
              <div className="relative">
                <button 
                  className="flex items-center space-x-1 text-slate-700 hover:text-blue-500 p-1"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span className="text-sm font-medium">{user?.username || "Cashier"}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 border border-slate-200">
                    <Link href="/settings">
                      <span className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100">Settings</span>
                    </Link>
                    <div className="border-t border-slate-200"></div>
                    <button 
                      onClick={() => logoutMutation.mutate()} 
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-slate-100"
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Row - Navigation and DateTime (Hidden on Mobile) */}
          {!isMobile && (
            <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Link href="/transactions">
                  <button className="flex items-center justify-center text-slate-700 hover:text-blue-500 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full">
                    <History size={16} className="mr-1" />
                    <span>History</span>
                  </button>
                </Link>
                <Link href="/analytics">
                  <button className="flex items-center justify-center text-slate-700 hover:text-blue-500 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full">
                    <BarChart size={16} className="mr-1" />
                    <span>Analytics</span>
                  </button>
                </Link>
              </div>
              <span className="text-xs text-slate-600">{formattedDateTime}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}
