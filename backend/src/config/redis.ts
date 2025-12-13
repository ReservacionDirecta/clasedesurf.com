import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: Redis | null = null;

const getRedisConfig = () => {
    // If REDIS_URL is provided (common in Railway/Heroku), use it
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }

    // Otherwise fallback to individual components
    return {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        // Railway specific: sometimes requires family 6 for IPv6
        family: process.env.REDIS_FAMILY ? parseInt(process.env.REDIS_FAMILY) : undefined,
    };
};

export const initializeRedis = () => {
    if (redisClient) return redisClient;

    const config = getRedisConfig();

    console.log('[Redis] Initializing connection...');

    // If config is a string (URL), mask the password for logging
    if (typeof config === 'string') {
        console.log(`[Redis] Connecting to URL: ${config.replace(/(:[^:@]+@)/, ':****@')}`);
    } else {
        console.log(`[Redis] Connecting to ${config.host}:${config.port}`);
    }

    redisClient = new Redis(config as any);

    redisClient.on('connect', () => {
        console.log('✅ [Redis] Connected successfully');
    });

    redisClient.on('error', (err) => {
        console.error('❌ [Redis] Connection error:', err);
    });

    return redisClient;
};

// Singleton instance getter
export const getRedisClient = () => {
    if (!redisClient) {
        return initializeRedis();
    }
    return redisClient;
};

export default getRedisClient;
