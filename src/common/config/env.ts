import dotenv from 'dotenv';

dotenv.config();

export default {
  env: process.env.NODE_ENV || 'development',
  mailgun_api_key: process.env.MAILGUN_API_KEY,
  mailgun_domain: process.env.MAILGUN_DOMAIN,
  mailgun_email: process.env.MAILGUN_EMAIL,
  mongodb_uri:
    process.env.MONGODB_URL || 'mongodb://localhost:27017/imperium_dev',
  port: Number(process.env.PORT) || 3009,
  redis_url: process.env.REDIS_URL || 'redis://localhost:6379',
  salt_rounds: process.env.SALT_ROUNDS || 10,
  jwt_secret: process.env.JWT_SECRET,
};
