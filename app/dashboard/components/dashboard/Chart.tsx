'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';


interface iAppProps {
  data: DataItem[];
}

interface DataItem {
  date: string;
  revenue: number;
}

const aggregateData = (data:DataItem[]) => {
  const aggregated: Record<string, number> = data.reduce((acc: Record<string, number>, curr: DataItem) => {
    acc[curr.date] = (acc[curr.date] || 0) + curr.revenue;
    return acc;
  }, {});

  return Object.entries(aggregated).map(([date, revenue]) => ({
    date,
    revenue,
  }));
};

const Chart = ({ data }: iAppProps) => {
  const processedData = aggregateData(data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />

        <Line
          type="monotone"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          dataKey="revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Chart;
