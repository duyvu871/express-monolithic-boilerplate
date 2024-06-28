import { getRedis, initRedis } from '@/configs/database/redis';

// initial redis
initRedis();
// get instance redis
const instanceRedis = getRedis().instanceRedis;
// get key
const getKey = async <T>(key: string): Promise<T | null> => {
	if (!instanceRedis) throw new Error('Redis not initialized');
	const result = await instanceRedis.get(key);
	if (result) return JSON.parse(result);
	return null;
};
// set key
const setKey = async <T>(key: string, value: T, expireIn: number): Promise<string> => {
	if (!instanceRedis) throw new Error('Redis not initialized');
	return instanceRedis.set(key, JSON.stringify(value), 'EX', expireIn);
};
// delete key
const deleteKey = async (key: string): Promise<number> => {
	if (!instanceRedis) throw new Error('Redis not initialized');
	return instanceRedis.del(key);
};

export { getKey, setKey, deleteKey };
