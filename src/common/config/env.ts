import dotenv from 'dotenv';

dotenv.config();

export default {
  env: process.env.NODE_ENV || 'development',
  mongodb_url: process.env.MONGODB_URL,
  port: Number(process.env.PORT) || 3080,
  redis_url: process.env.REDIS_URL || 'redis://localhost:6379',
};
