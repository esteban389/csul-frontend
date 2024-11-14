'use client';

import { ReactNode } from 'react';
import useAuth from '@/hooks/useAuth';
import UserDropdown from '@/components/UserDropdown';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import RouteBreadcrumb from '@/components/RouteBreadcrumb';

function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth({ middleware: 'auth' });
  if (!user) return null;
  return (
    <SidebarProvider>
      <AppSidebar className="!border-0" />
      <div className="m-4 ml-2 flex w-full flex-col overflow-y-hidden rounded-2xl border-sidebar-border bg-background shadow-md">
        <header className="flex h-16 w-full shrink-0 items-center justify-between gap-2 px-4 py-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <RouteBreadcrumb />
          </div>
          <UserDropdown user={user} logout={logout} />
        </header>
        <ScrollArea className="h-full">{children}</ScrollArea>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;