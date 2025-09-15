import React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar className="w-64" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Page Content */}
        <main className={cn("flex-1 overflow-auto", className)}>
          {children}
        </main>
      </div>
    </div>
  );
};
