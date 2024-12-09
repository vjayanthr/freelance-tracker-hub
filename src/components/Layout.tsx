import { Link, useLocation } from "react-router-dom";
import { Clock, Users, Folder, PieChart, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Clock, label: "Time Tracking", path: "/" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Folder, label: "Projects", path: "/projects" },
  { icon: PieChart, label: "Reports", path: "/reports" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Freelance Hub</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex h-[calc(100vh-57px)] lg:h-screen">
        {/* Sidebar */}
        <nav
          className={cn(
            "fixed inset-0 z-50 bg-white lg:static w-64 transform transition-transform duration-200 ease-in-out border-r",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="p-6 hidden lg:block">
            <h1 className="text-xl font-semibold">Freelance Hub</h1>
          </div>
          <div className="space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-white"
                    : "hover:bg-muted text-secondary"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}