// import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
  enableAutoPipelining: false,
});

export default redis;
