import { SidebarProvider } from "@/components/ui/sidebar";
import Navigation from "./Navigation";
import { AppSidebar } from "./AppSidebar";
import type { Project } from "@/types";

interface LayoutProps {
  children: React.ReactNode;
  onProjectSelect?: (project: Project) => void;
}

export default function Layout({ children, onProjectSelect }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        {onProjectSelect && <AppSidebar onProjectSelect={onProjectSelect} />}
        <div className="flex-1">
          <Navigation />
          <main className="container mx-auto py-6 px-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}