import DashboardStats from './components/dashboard/DashboardStats';
import RecentSales from './components/dashboard/RecentSales';


import ChartBarClient from './components/dashboard/ChartBarClient';
import React from 'react';
import { prisma } from '@/lib/prisma';

const Dashboard = async () => {
  const monthlySales = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'long' }),
    desktop: 0,
  }));

  const orders = await prisma.order.findMany({
    where: {
      status: 'paid',
    },
    select: {
      createdAt: true,
      totalAmount: true,
    },
  });

  orders.forEach(order => {
    const month = order.createdAt.getMonth(); // 0-11
    monthlySales[month].desktop += order.totalAmount / 100;
  });

  return (
    <>
      <DashboardStats />
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
        <ChartBarClient data={monthlySales} />
        <RecentSales />
      </div>
    </>
  );
};

export default Dashboard;
