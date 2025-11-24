'use client';

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import DashboardNavigation from './DashboardNavigation';
import { Button } from '@/components/ui/button';
import { MenuIcon } from 'lucide-react';

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="shrink-0 md:hidden"
          variant={'outline'}
          size={'icon'}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
        <nav className="flex flex-col text-lg gap-6 font-medium mt-5 ml-4">

          <DashboardNavigation />

        </nav>
      </SheetContent>
    </Sheet>
  );
}
