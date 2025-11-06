import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import DashboardStats from './components/dashboard/DashboardStats';
import RecentSales from './components/dashboard/RecentSales';
import { SalesChart } from './components/SalesChart';


// async function getData() {
  // const now = new Date();
  // const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Corrigido: 7 dias em milissegundos

  // const data = await prisma.order.findMany({
  //   where: {
  //     createdAt: {
  //       gte: sevenDaysAgo,
  //     },
  //   },
  //   select: {
  //     amount: true,
  //     createdAt: true,
  //   },
  //   orderBy: {
  //     createdAt: 'asc',
  //   },
  // });

  // const result = data.map((item) => ({
  //   date: new Intl.DateTimeFormat('pt-BR').format(item.createdAt),
  //   revenue: item.amount / 100, // Corrigido: "amout" → "amount"
  // }));

  // return result;
// }

const Dashboard = async () => {
  // const data = await getData();

  return (
    <>
      <DashboardStats />
      <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              Recent Transaction from the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {/* <SalesChart /> */}
          </CardContent>
        </Card>
        <RecentSales />
      </div>
    </>
  );
};

export default Dashboard;
