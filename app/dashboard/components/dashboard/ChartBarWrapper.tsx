'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const ChartBarDefault = dynamic(
  () => import('./ChartBarDefault').then((mod) => mod.ChartBarDefault),
  {
    ssr: false,
    loading: () => <p>Loading chart...</p>,
  }
);

interface ChartBarWrapperProps {
  salesData: { month: string; sales: number }[];
}

export function ChartBarWrapper({ salesData }: ChartBarWrapperProps) {
  return <ChartBarDefault salesData={salesData} />;
}
