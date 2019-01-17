import redis, { RedisClient } from 'redis';
import { injectable } from 'inversify';
import { promisify } from 'util';
import env from '../config/env';

@injectable()
export default class RedisService implements IRedisService {
  redis: RedisClient;
  hdel: (hash: string, field: string) => Promise<any>;
  hget: (hash: string, field: string) => Promise<string>;
  hgetall: (key: string) => Promise<object>;
  hset: (hash: string, field: string, value: any) => Promise<any>;
  set: (
    key: string,
    value: any,
    mode?: string,
    duration?: number,
  ) => Promise<any>;
  get: (key: string) => Promise<string>;

  constructor() {
    this.redis = redis.createClient({ url: env.redis_url });
    this.hdel = promisify(this.redis.hdel).bind(this.redis);
    this.hget = promisify(this.redis.hget).bind(this.redis);
    this.hgetall = promisify(this.redis.hgetall).bind(this.redis);
    this.hset = promisify(this.redis.hset).bind(this.redis);
    this.set = promisify(this.redis.set).bind(this.redis);
    this.get = promisify(this.redis.get).bind(this.redis);

    this.redis.on('error', err => {
      console.log('An error occured while initialzing redis client');
      console.log(err);
    });
  }
}

export interface IRedisService {
  redis: RedisClient;
  hdel(hash: string, field: string): Promise<any>;
  hget(hash: string, field: string): Promise<string>;
  hgetall(key: string): Promise<object>;
  hset(hash: string, field: string, value: any): Promise<any>;
  set(key: string, value: any, mode?: string, duration?: number): Promise<any>;
  get(key: string): Promise<string>;
}
