import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        // pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
    ],
  },
  env: {
    ASAAS_SANDBOX_KEY: '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmIzZDNmMmIzLTRiNTctNDUzNC04ODcxLTIyOWJjNjdhNTc0Njo6JGFhY2hfYWU5YmE1MDEtYTkzNy00NjBkLTk0N2ItY2ExNTFkMjkwNWI3', // Substitua pela sua chave real
  },
};

export default nextConfig;