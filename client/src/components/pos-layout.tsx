import { ReactNode, useState, useEffect } from "react";
import { format } from "date-fns";
import { ScanBarcode, ChevronDown } from "lucide-react";

interface POSLayoutProps {
  children: ReactNode;
}

export default function POSLayout({ children }: POSLayoutProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-blue-500 text-2xl">
              <ScanBarcode size={28} />
            </span>
            <h1 className="text-xl font-bold text-slate-800">SimplePOS</h1>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">{formattedDateTime}</span>
            <div className="relative">
              <button 
                className="flex items-center space-x-1 text-slate-700 hover:text-blue-500"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="text-sm font-medium">Cashier</span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Settings</a>
                  <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Help</a>
                  <div className="border-t border-slate-200"></div>
                  <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-slate-100">Logout</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
