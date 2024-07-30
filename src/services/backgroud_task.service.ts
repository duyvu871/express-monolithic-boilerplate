import { Job, Queue } from 'bullmq';
import env from '@/configs/env';

type queue_name = 'background_task' | 'audio_handle_queue' | 'example_task';

export default class BackgroundTaskService {
	public static DEFAULT_REMOVE_CONFIG = {
		removeOnComplete: {
			age: 3600, // 1 hour
		},
		removeOnFail: {
			age: 24 * 3600, // 24 hours
		},
	};
	private static queue: Queue;
	public static get_queue(queue_name: queue_name = 'background_task'): Queue {
		if (!this.queue) {
			this.queue = new Queue(queue_name, {
				connection: {
					host: env.REDIS_HOST,
					port: parseInt(env.REDIS_PORT),
					password: env.REDIS_PASSWORD,
					username: env.REDIS_USERNAME,
				},
			});
		}

		return this.queue;
	}
	public static add_task<T>(queue_name: queue_name,task_name: string, data: T): Promise<Job<T>> {
		return this.get_queue(queue_name).add(task_name, data, this.DEFAULT_REMOVE_CONFIG);
	}
}
