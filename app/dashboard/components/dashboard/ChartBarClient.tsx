'use client';

import dynamic from 'next/dynamic';

const ChartBarDefault = dynamic(() => import('./ChartBarDefault').then((mod) => mod.ChartBarDefault), {
  ssr: false,
  loading: () => <p>Loading chart...</p>,
});

interface ChartBarClientProps {
  data: { month: string; desktop: number }[];
}

const ChartBarClient: React.FC<ChartBarClientProps> = ({ data }) => {
  return <ChartBarDefault data={data} />;
};

export default ChartBarClient;
