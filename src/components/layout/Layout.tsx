import React from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Main Content - Full Width */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        {/* <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                N
              </span>
            </div>
            <h1 className="font-semibold text-xl">Nexus Leads</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">Dashboard</div>
          </div>
        </header> */}

        {/* Page Content */}
        <main className={cn("flex-1 overflow-auto", className)}>
          {children}
        </main>
      </div>
    </div>
  );
};
