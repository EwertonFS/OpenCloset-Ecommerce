import DashboardNavigation from './components/dashboard/DashboardNavigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import { UserNav } from './components/dashboard/UserNav';
import { MobileNav } from './components/dashboard/MobileNav';



const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const { getUser } = getKindeServerSession();

  const user = await getUser();

  if (!user || (user.email !== 'ewerton.businees@gmail.com' && user.email !== 'erickalais13@gmail.com')) {
    redirect('/');
  }

  return (
    <div className="flex  w-full flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b">
        <DashboardNavigation />
        <MobileNav />
        <UserNav />
      </header>
      <main className="my-5">{children}</main>
    </div>
  );
};

export default DashboardLayout;
