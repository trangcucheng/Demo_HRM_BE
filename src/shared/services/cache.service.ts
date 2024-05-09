import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class CacheService {
    private readonly redisClient: Redis;
    private readonly prefix: string = process.env.REDIS_PREFIX;

    constructor(private readonly redisService: RedisService) {
        if (!this.redisClient) {
            this.redisClient = this.redisService.getClient();
            Logger.log('Redis connected', 'CacheService');
        }
    }

    public async isExist(key: string): Promise<boolean> {
        const result = await this.redisClient.exists(key);
        return result === 1;
    }

    public async get(key: string): Promise<any> {
        const value = await this.redisClient.get(`${this.prefix}:${key}`);
        if (value === null || value === undefined) return null;
        return value;
    }

    public set(key: string, value: any, expire: number = 60 * 60 * 24) {
        if (value !== null && value !== undefined) {
            this.redisClient.set(`${this.prefix}:${key}`, value, 'EX', expire);
        }
    }

    public async getJson(key: string): Promise<any> {
        const result = await this.redisClient.get(`${this.prefix}:${key}`);
        if ([null, undefined, '', '{}', '[]'].includes(result)) return null;

        const json = JSON.parse(result);
        if (this.isObjectEmpty(json)) return null;

        return json;
    }

    public setJson(key: string, value: { [key: string]: any }, expire: number = 60 * 60 * 24) {
        if (value !== null && value !== undefined) {
            this.redisClient.set(`${this.prefix}:${key}`, JSON.stringify(value), 'EX', expire);
        }
    }

    public async delete(key: string) {
        this.redisClient.del(`${this.prefix}:${key}`);
    }

    /**
     * Delete keys with pattern
     * @param pattern use '' (empty string) to delete all keys
     */
    public async deletePattern(pattern: string) {
        const keys = await this.redisClient.keys(`${this.prefix}:${pattern}*`);
        if (keys.length > 0) this.redisClient.del(keys);
    }

    public async deleteKeys(keys: string[]) {
        if (keys.length > 0) this.redisClient.del(keys);
    }

    private isObjectEmpty(obj: any) {
        return obj === null || obj === undefined || Object.keys(obj).length === 0;
    }
}
