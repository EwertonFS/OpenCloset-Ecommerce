'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const ChartBarClient = dynamic(() => import('./dashboard/ChartBarClient').then((mod) => mod.default), {
  ssr: false,
  loading: () => <p>Loading chart...</p>,
});

interface ChartBarWrapperProps {
  data: { month: string; desktop: number }[];
}

export function ChartBarWrapper({ data }: ChartBarWrapperProps) {
  return <ChartBarClient data={data} />;
}
