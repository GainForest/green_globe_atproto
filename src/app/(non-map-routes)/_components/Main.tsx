"use client";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
export function Main({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();
  return (
    <main
      className={cn(
        "m-2 border border-border rounded-lg flex-1 bg-background",
        open ? "ml-0" : "ml-2"
      )}
    >
      <div className="w-full sticky top-0 flex items-center p-2 border-b border-b-border">
        <SidebarTrigger />
      </div>
      {children}
    </main>
  );
}
