import {Queue} from 'bullmq';
import env from '@/configs/env';

export default class BackgroundTaskService {
	private static queue: Queue;
	public static async get_queue() {
		if (!this.queue) {
			this.queue = new Queue('background_task', {
				connection: {
					host: env.REDIS_HOST,
					port: parseInt(env.REDIS_PORT),
				}
			});
		}
		return this.queue;
	}
	public static async add_task(name: string, data: any) {
		const queue = await this.get_queue();
		await queue.add(name, data);
	}
	public static async add_task_callback(name: string, data: any, callback: (data: any) => void) {
		const queue = await this.get_queue();
		await queue.add(name, data).then(callback);
	}
	public static async retry_task(jobId: string) {
		const queue = await this.get_queue();
		await queue.getJob(jobId).then(job => job?.retry());
	}
}