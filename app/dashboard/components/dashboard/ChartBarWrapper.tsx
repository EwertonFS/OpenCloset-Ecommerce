'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const ChartBarDefault = dynamic(
  () => import('./ChartBarDefault'),
  {
    ssr: false,
    loading: () => <p>Loading chart...</p>,
  }
);

interface ChartBarWrapperProps {
  salesData: { month: string; sales: number }[];
}

export function ChartBarWrapper({ salesData }: ChartBarWrapperProps) {
  const chartData = salesData.map((item) => ({
    month: item.month,
    desktop: item.sales,
  }));
  return <ChartBarDefault data={chartData} />;
}
